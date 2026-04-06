const TaskEntry = require('../models/TaskEntry');
const User = require('../models/User');
const DailyLog = require('../models/DailyLog');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// Helper to get dates in range
const getDatesInRange = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    while (currentDate <= end) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
};

// 🔧 ENHANCED TEXT CLEANING FUNCTION - Strips AI garbage text and corrupted responses
const cleanCellText = (text, maxLength = 120) => {
    if (!text || typeof text !== 'string') return '';
    
    // Skip if it looks like AI response garbage (contains Ø, Û, or similar encoding artifacts)
    if (/[ØÛÞß§¤£¥µ²³¹¼½¾¿]/.test(text)) {
        console.log('[PDF CLEAN] Stripped garbled text:', text.substring(0, 50));
        return '';
    }
    
    // Strip common AI response prefixes that indicate non-data content
    const aiResponsePatterns = [
        /^got it[\s,:.-]*/i,
        /^sure[\s,:.-]*/i,
        /^of course[\s,:.-]*/i,
        /^yes[\s,:.-]*/i,
        /^here[\s,:.-]*/i,
        /^thank you[\s,:.-]*/i,
        /^thanks[\s,:.-]*/i,
        /^.et me/i,
        /^.orrected/i,
        /^.orrecting/i,
        /^ai:+/i,
        /^assistant:+/i,
        /^output:+/i,
        /^response:+/i,
        /^note:+/i,
        /^analysis:+/i,
    ];
    
    for (const pattern of aiResponsePatterns) {
        text = text.replace(pattern, '');
    }
    
    // Strip encoded/garbage patterns
    text = text.replace(/Ø/g, 'O').replace(/Û/g, 'U').replace(/Þ/g, 'P').replace(/ß/g, 'ss');
    
    // Strip URLs
    text = text.replace(/https?:\/\/[^\s]+/g, '');
    
    // Strip newlines, tabs, and carriage returns
    text = text.replace(/[\r\n\t]+/g, ' ');
    
    // Strip excessive whitespaces
    text = text.replace(/\s{2,}/g, ' ');
    
    text = text.trim();
    
    // If text is too short after cleaning or is just noise, return empty
    if (text.length < 3) return '';
    
    // Truncate to maxLength
    return text.length > maxLength
        ? text.substring(0, maxLength) + '...'
        : text;
};

// Helper: DD.MM.YYYY format using dots
const formatDate = (date) => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}.${m}.${y}`;
};

// @desc    Generate PDF report (Weekly Grid Format)
// @route   GET /api/reports/pdf
// @access  Private (Admin)
const generatePDF = async (req, res) => {
    try {
        let { dept, from, to } = req.query;

        // Default to current week (Mon-Sat) if no range provided
        if (!from || !to) {
            const now = new Date();
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1); // get Monday
            const monday = new Date(now.setDate(diff));
            monday.setHours(0, 0, 0, 0);
            
            const saturday = new Date(monday);
            saturday.setDate(monday.getDate() + 5);
            saturday.setHours(23, 59, 59, 999);
            
            if (!from) from = monday.toISOString();
            if (!to) to = saturday.toISOString();
        }

        const startDate = new Date(from);
        const endDate = new Date(to);
        const dateRange = getDatesInRange(startDate, endDate);

        // Fetch staff
        // NEW: Check if user is Admin or Staff. 
        // If Staff: They can ONLY see their own data.
        // If Admin: They can see all or by department.
        const isAdmin = req.user.role === 'admin';
        const staffQuery = { role: 'staff' };
        
        if (!isAdmin) {
            staffQuery._id = req.user._id;
        } else if (dept) {
            staffQuery.department = dept;
        }
        
        const staffList = await User.find(staffQuery).sort({ name: 1 });

        // Fetch logs and tasks for all staff in range
        const staffIds = staffList.map(s => s._id);
        const [logs, tasks] = await Promise.all([
            DailyLog.find({ staff: { $in: staffIds }, date: { $gte: startDate, $lte: endDate } }),
            TaskEntry.find({ staff: { $in: staffIds }, date: { $gte: startDate, $lte: endDate } })
        ]);

        // Create PDF document (Landscape)
        const doc = new PDFDocument({ 
            layout: 'landscape', 
            margin: 30,
            size: 'A4'
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=CFRD_Weekly_Report_${new Date().toISOString().split('T')[0]}.pdf`);

        doc.pipe(res);

        const pageWidth = doc.page.width;
        const logoPath = fs.existsSync(path.join(__dirname, '..', '..', '..', 'dawnow-frontend', 'public', 'images', 'logo-jjcet.jpg'))
            ? path.join(__dirname, '..', '..', '..', 'dawnow-frontend', 'public', 'images', 'logo-jjcet.jpg')
            : path.join(__dirname, '..', 'assets', 'logo-jjcet.jpg');

        // --- Header Section Drawing Function (to reuse for new pages) ---
        const drawHeader = (doc, currentY) => {
            const infoColsWidth = 35; // S.No
            const nameColWidth = 110;
            const desigColWidth = 90;
            const tableActualWidth = pageWidth - 60;
            const remainingWidth = tableActualWidth - infoColsWidth - nameColWidth - desigColWidth;
            const dayColWidth = remainingWidth / dateRange.length;

            // BUG 3 FIX — Pink header row with stroke
            doc.rect(30, currentY, tableActualWidth, 30)
               .fillAndStroke('#fce4ec', '#000000');
            
            doc.fillColor('#000000').fontSize(9).font('Helvetica-Bold');

            // Header Column Texts
            doc.text('S.No', 30, currentY + 11, { width: infoColsWidth, align: 'center' });
            doc.text('Name', 30 + infoColsWidth, currentY + 11, { width: nameColWidth, align: 'center' });
            doc.text('Designation', 30 + infoColsWidth + nameColWidth, currentY + 11, { width: desigColWidth, align: 'center' });

            dateRange.forEach((date, i) => {
                const x = 30 + infoColsWidth + nameColWidth + desigColWidth + (i * dayColWidth);
                doc.text(formatDate(date), x, currentY + 11, { width: dayColWidth, align: 'center' });
            });

            // Header Bottom Thick Border
            doc.strokeColor('#000000').lineWidth(1)
               .moveTo(30, currentY + 30).lineTo(pageWidth - 30, currentY + 30).stroke();

            return currentY + 30;
        };

        // --- Main Title & Logo ---
        // BUG 1 FIX — Logo overlapping title
        let headerBottom = 30;
        if (fs.existsSync(logoPath)) {
            const logoWidth = 300;
            const logoX = (pageWidth - logoWidth) / 2;
            doc.image(logoPath, logoX, 10, { width: logoWidth });
            headerBottom = 10 + 90 + 15; // logo top + logo height + gap
        }

        let diffDays = Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24));
        const reportTypeLabel = (diffDays > 7) ? 'Monthly Report' : 'Weekly Report';

        doc.fillColor('#000000').fontSize(11).font('Helvetica-Bold')
           .text(`Center for Research and Development - ${reportTypeLabel}`, 30, headerBottom, { align: 'center', width: pageWidth - 60 });
        
        doc.fontSize(9).font('Helvetica')
           .text(`(${formatDate(startDate)} to ${formatDate(endDate)})`, 30, headerBottom + 14, { align: 'center', width: pageWidth - 60 });

        // --- Layout Selection ---
        diffDays = Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24));
        const isMonthly = diffDays > 7;

        if (!isMonthly) {
            // --- WEEKLY GRID FORMAT (Existing) ---
            currentY = 145; 
            currentY = drawHeader(doc, currentY);

            const infoColsWidth = 35;
            const nameColWidth = 110;
            const desigColWidth = 90;
            const tableActualWidth = pageWidth - 60;
            const remainingWidth = tableActualWidth - infoColsWidth - nameColWidth - desigColWidth;
            const dayColWidth = remainingWidth / dateRange.length;

            staffList.forEach((staff, sIdx) => {
                const rowContents = [];
                dateRange.forEach(date => {
                    const dayLog = logs.find(l => {
                        const lDate = new Date(l.date);
                        return lDate.getDate() === date.getDate() && 
                               lDate.getMonth() === date.getMonth() && 
                               lDate.getFullYear() === date.getFullYear() &&
                               l.staff.toString() === staff._id.toString();
                    });

                    const dayTasks = tasks.filter(t => {
                        const tDate = new Date(t.date);
                        return tDate.getDate() === date.getDate() && 
                               tDate.getMonth() === date.getMonth() && 
                               tDate.getFullYear() === date.getFullYear() &&
                               t.staff.toString() === staff._id.toString();
                    });

                    if (dayLog && dayLog.isLeaveDay) {
                        rowContents.push({ type: 'leave' });
                        return;
                    }

                    let items = [];
                    const cleanItem = (str) => {
                        if (!str || typeof str !== 'string') return '';
                        // Detect garbled/AI garbage text and strip it
                        if (/[ØÛÞß§¤£¥µ²³¹¼½¾¿]/.test(str)) {
                            return '';
                        }
                        // Clean as before + basic AI prefix stripping
                        let cleaned = str.trim()
                            .replace(/^[0-9]+[\.\)\-\s]+/, '')
                            .replace(/^(got it|of course|sure|yes|here|thank you|thanks|let me|corrected)\s*:*/i, '')
                            .trim();
                        if (cleaned.length < 3) return '';
                        if (cleaned.length > 60) {
                            return cleaned.substring(0, 57).trim() + '...';
                        }
                        return cleaned;
                    };

                    // NEW: Pull work summary from Daily Log first as it represents the daily entry
                    if (dayLog && dayLog.workDone) {
                        items.push(`${dayLog.category || 'Work'}: ${cleanItem(dayLog.workDone)}`);
                    }
                    
                    dayTasks.forEach(task => {
                        if (task.paperTitle) items.push(`Paper: ${cleanItem(task.paperTitle)}`);
                        if (task.projectName) items.push(`Project: ${cleanItem(task.projectName)}`);
                        if (task.patentTitle) items.push(`Patent: ${cleanItem(task.patentTitle)}`);
                        if (task.bookTitle) items.push(`Book: ${cleanItem(task.bookTitle)}`);
                        if (task.activityTitle) items.push(`Activity: ${cleanItem(task.activityTitle)}`);
                        for (let i = 1; i <= 5; i++) {
                            if (task[`additionalWorkload${i}`]) items.push(cleanItem(task[`additionalWorkload${i}`]));
                        }
                        
                        if (task.dynamicAnswers && typeof task.dynamicAnswers === 'object') {
                            Object.values(task.dynamicAnswers).forEach(val => {
                                if (val && typeof val === 'string' && val.trim() !== '') {
                                    items.push(cleanItem(val));
                                } else if (Array.isArray(val) && val.length > 0) {
                                    items.push(cleanItem(val.join(', ')));
                                }
                            });
                        }
                    });

                    items = items.filter((v, i, a) => v && a.indexOf(v) === i).slice(0, 7); 
                    rowContents.push(items.length > 0 ? { type: 'text', items } : { type: 'empty' });
                });

                let maxRowHeight = 40; 
                rowContents.forEach(content => {
                    if (content.type === 'text') {
                        const combined = content.items.map((it, idx) => `${idx + 1}. ${it}`).join('\n');
                        const textHeight = doc.heightOfString(combined, { width: dayColWidth - 10, size: 7.5 });
                        if (textHeight + 20 > maxRowHeight) maxRowHeight = textHeight + 20;
                    }
                });
                if (maxRowHeight > 150) maxRowHeight = 150;

                if (currentY + maxRowHeight > doc.page.height - 50) {
                    doc.addPage();
                    currentY = 50;
                    currentY = drawHeader(doc, currentY);
                }

                const rowColor = (sIdx % 2 === 0) ? '#e8f5e9' : '#e3f2fd';
                doc.fillColor(rowColor).rect(30, currentY, tableActualWidth, maxRowHeight).fill();
                doc.strokeColor('#000000').lineWidth(0.3).rect(30, currentY, tableActualWidth, maxRowHeight).stroke();
                
                doc.strokeColor('#cbd5e1').lineWidth(0.3);
                doc.moveTo(30 + infoColsWidth, currentY).lineTo(30 + infoColsWidth, currentY + maxRowHeight).stroke();
                doc.moveTo(30 + infoColsWidth + nameColWidth, currentY).lineTo(30 + infoColsWidth + nameColWidth, currentY + maxRowHeight).stroke();
                doc.moveTo(30 + infoColsWidth + nameColWidth + desigColWidth, currentY).lineTo(30 + infoColsWidth + nameColWidth + desigColWidth, currentY + maxRowHeight).stroke();

                doc.fillColor('#000000');
                const nameY = currentY + (maxRowHeight / 2) - 4.5;
                doc.font('Helvetica').fontSize(9).text(`${sIdx + 1}`, 30, nameY, { width: infoColsWidth, align: 'center' });
                let staffName = staff.name || 'Staff';
                if (!staffName.toLowerCase().startsWith('dr.')) staffName = `Dr. ${staffName}`;
                doc.font('Helvetica-Bold').text(staffName, 30 + infoColsWidth + 5, nameY, { width: nameColWidth - 10 });
                doc.font('Helvetica').fontSize(8).text(`${staff.designation || 'Staff'}\n(${staff.department || 'CFRD'})`, 30 + infoColsWidth + nameColWidth, nameY - 4, { width: desigColWidth, align: 'center' });

                dateRange.forEach((_, i) => {
                    const colX = 30 + infoColsWidth + nameColWidth + desigColWidth + (i * dayColWidth);
                    const content = rowContents[i];
                    if (content.type === 'text') {
                        let itemY = currentY + 10;
                        content.items.forEach((item, idx) => {
                            const itemHeight = doc.heightOfString(`${idx + 1}. ${item}`, { width: dayColWidth - 10, size: 7.5 });
                            if (itemY + itemHeight <= currentY + maxRowHeight - 8) {
                                doc.font('Helvetica').fontSize(7.5).text(`${idx + 1}. ${item}`, colX + 5, itemY, { width: dayColWidth - 10 });
                                itemY += itemHeight + 3;
                            }
                        });
                    } else if (content.type === 'leave') {
                        doc.font('Helvetica-Bold').fontSize(8).fillColor('#f97316').text('Leave', colX, currentY + (maxRowHeight/2) - 4, { width: dayColWidth, align: 'center' });
                        doc.fillColor('#000000');
                    } else {
                        doc.font('Helvetica-Oblique').fontSize(8).fillColor('#ef4444').text('Not Entered', colX, currentY + (maxRowHeight/2) - 4, { width: dayColWidth, align: 'center' });
                        doc.fillColor('#000000');
                    }
                    doc.strokeColor('#cbd5e1').moveTo(colX, currentY).lineTo(colX, currentY + maxRowHeight).stroke();
                });
                currentY += maxRowHeight;
            });
        } else {
            // --- MONTHLY LIST FORMAT (New) ---
            currentY = 145;
            
            staffList.forEach((staff, sIdx) => {
                // Staff Header Row
                if (currentY + 60 > doc.page.height - 50) { doc.addPage(); currentY = 50; }
                
                doc.fillColor('#fce4ec').rect(30, currentY, pageWidth - 60, 25).fill();
                doc.strokeColor('#000000').lineWidth(0.5).rect(30, currentY, pageWidth - 60, 25).stroke();
                
                let staffName = staff.name || 'Staff';
                if (!staffName.toLowerCase().startsWith('dr.')) staffName = `Dr. ${staffName}`;
                doc.fillColor('#000000').font('Helvetica-Bold').fontSize(10)
                   .text(`${sIdx + 1}. ${staffName} - ${staff.designation || 'Staff'} (${staff.department || 'CFRD'})`, 40, currentY + 7);
                
                currentY += 25;

                // Create a sub-table for dates
                dateRange.forEach((date, dIdx) => {
                    const dayLog = logs.find(l => {
                        const lDate = new Date(l.date);
                        return lDate.getDate() === date.getDate() && lDate.getMonth() === date.getMonth() && lDate.getFullYear() === date.getFullYear() && l.staff.toString() === staff._id.toString();
                    });

                    const dayTasks = tasks.filter(t => {
                        const tDate = new Date(t.date);
                        return tDate.getDate() === date.getDate() && tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear() && t.staff.toString() === staff._id.toString();
                    });

                    let items = [];
                    if (dayLog && dayLog.isLeaveDay) items = ['Leave'];
                    else {
                        // Include Daily Log entry with cleaning
                        if (dayLog && dayLog.workDone) {
                            const cleaned = cleanCellText(dayLog.workDone, 100);
                            if (cleaned) items.push(`${dayLog.category || 'Daily Work'}: ${cleaned}`);
                        }

                        dayTasks.forEach(task => {
                            if (task.paperTitle) { const c = cleanCellText(task.paperTitle, 60); if (c) items.push(`Paper: ${c}`); }
                            if (task.projectName) { const c = cleanCellText(task.projectName, 60); if (c) items.push(`Project: ${c}`); }
                            if (task.patentTitle) { const c = cleanCellText(task.patentTitle, 60); if (c) items.push(`Patent: ${c}`); }
                            if (task.bookTitle) { const c = cleanCellText(task.bookTitle, 60); if (c) items.push(`Book: ${c}`); }
                            if (task.activityTitle) { const c = cleanCellText(task.activityTitle, 60); if (c) items.push(`Activity: ${c}`); }
                            
                            if (task.dynamicAnswers && typeof task.dynamicAnswers === 'object') {
                                Object.values(task.dynamicAnswers).forEach(val => {
                                    if (val && typeof val === 'string' && val.trim() !== '') {
                                        const c = cleanCellText(val, 60);
                                        if (c) items.push(c);
                                    } else if (Array.isArray(val) && val.length > 0) {
                                        const c = cleanCellText(val.join(', '), 60);
                                        if (c) items.push(c);
                                    }
                                });
                            }
                        });
                    }

                    if (items.length === 0) return; // Skip "Not Entered" in monthly to save space

                    const contentText = items.map((it, i) => items[0] === 'Leave' ? 'LEAVE' : `${i + 1}. ${it}`).join('\n');
                    const contentHeight = Math.max(20, doc.heightOfString(contentText, { width: pageWidth - 160, size: 8 }) + 10);

                    if (currentY + contentHeight > doc.page.height - 50) {
                        doc.addPage();
                        currentY = 50;
                        // Repeat staff name on new page if continuing
                        doc.fillColor('#fdf2f8').rect(30, currentY, pageWidth - 60, 20).fill();
                        doc.fillColor('#000000').font('Helvetica-Bold').fontSize(9).text(`${staffName} (continued...)`, 40, currentY + 5);
                        currentY += 20;
                    }

                    // Draw entry row
                    doc.fillColor(dIdx % 2 === 0 ? '#ffffff' : '#f8fafc').rect(30, currentY, pageWidth - 60, contentHeight).fill();
                    doc.strokeColor('#cbd5e1').lineWidth(0.2).rect(30, currentY, pageWidth - 60, contentHeight).stroke();

                    doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(8).text(formatDate(date), 40, currentY + 6);
                    
                    if (items[0] === 'Leave') {
                        doc.fillColor('#f97316').text('LEAVE', 110, currentY + 6);
                    } else {
                        doc.fillColor('#334155').font('Helvetica').fontSize(8).text(contentText, 110, currentY + 6, { width: pageWidth - 160 });
                    }

                    currentY += contentHeight;
                });
                
                currentY += 15; // Space between staff members
            });
        }

        doc.end();
    } catch (error) {
        console.error('PDF Generation Error:', error);
        res.status(500).json({ message: 'Server error generating PDF' });
    }
};


// @desc    Generate Excel report (Weekly Grid Format)
// @route   GET /api/reports/excel
// @access  Private (Admin)
const generateExcel = async (req, res) => {
    try {
        let { dept, from, to } = req.query;

        if (!from || !to) {
            const now = new Date();
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);
            const monday = new Date(now.setDate(diff));
            monday.setHours(0, 0, 0, 0);
            const saturday = new Date(monday);
            saturday.setDate(monday.getDate() + 5);
            saturday.setHours(23, 59, 59, 999);
            if (!from) from = monday.toISOString();
            if (!to) to = saturday.toISOString();
        }

        const startDate = new Date(from);
        const endDate = new Date(to);
        const dateRange = getDatesInRange(startDate, endDate);

        // Fetch staff
        const isAdmin = req.user.role === 'admin';
        const staffQuery = { role: 'staff' };

        if (!isAdmin) {
            staffQuery._id = req.user._id;
        } else if (dept) {
            staffQuery.department = dept;
        }

        const staffList = await User.find(staffQuery).sort({ name: 1 });

        const staffIds = staffList.map(s => s._id);
        const [logs, tasks] = await Promise.all([
            DailyLog.find({ staff: { $in: staffIds }, date: { $gte: startDate, $lte: endDate } }),
            TaskEntry.find({ staff: { $in: staffIds }, date: { $gte: startDate, $lte: endDate } })
        ]);

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Weekly Report');

        // Header Title Area
        const totalCols = 3 + dateRange.length;
        sheet.mergeCells(1, 1, 1, totalCols);
        sheet.getRow(1).height = 100; // Increased height for logo

        const diffDaysExcel = Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24));
        const reportTypeLabelExcel = (diffDaysExcel > 7) ? 'Monthly Report' : 'Weekly Report';

        const titleCell = sheet.getCell(1, 1);
        titleCell.value = `Center for Research and Development - ${reportTypeLabelExcel}`;
        titleCell.font = { bold: true, size: 14 };
        titleCell.alignment = { horizontal: 'center', vertical: 'bottom' };

        // Add Logo centered in the top area
        const logoPath = fs.existsSync(path.join(__dirname, '..', '..', '..', 'dawnow-frontend', 'public', 'images', 'logo-jjcet.jpg'))
            ? path.join(__dirname, '..', '..', '..', 'dawnow-frontend', 'public', 'images', 'logo-jjcet.jpg')
            : path.join(__dirname, '..', 'assets', 'logo-jjcet.jpg');
        if (fs.existsSync(logoPath)) {
            const logo = workbook.addImage({
                filename: logoPath,
                extension: 'jpeg',
            });
            // Better centering: (totalCols - columns_spanned) / 2
            // We'll span it centrally
            const startCol = Math.max(0, (totalCols / 2) - 1.5);
            sheet.addImage(logo, {
                tl: { col: startCol, row: 0.1 },
                ext: { width: 300, height: 95 }
            });
        }

        sheet.mergeCells(2, 1, 2, totalCols);
        const rangeCell = sheet.getCell(2, 1);
        rangeCell.value = `(${startDate.toLocaleDateString('en-GB')} to ${endDate.toLocaleDateString('en-GB')})`;
        rangeCell.font = { bold: true, size: 11 };
        rangeCell.alignment = { horizontal: 'center', vertical: 'middle' };
        sheet.getRow(2).height = 25;

        // Table Header Row
        const headerItems = ['S.No', 'Name', 'Designation', ...dateRange.map(d => d.toLocaleDateString('en-GB'))];
        const headerRow = sheet.addRow(headerItems);
        
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF87171' }
            };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        // Data Rows
        staffList.forEach((staff, sIdx) => {
            const staffLogs = logs.filter(l => l.staff.toString() === staff._id.toString());
            const rowData = [
                sIdx + 1,
                staff.name || 'Unknown Staff',
                (staff.designation || 'Staff') + (staff.department ? ` (${staff.department})` : '')
            ];

            dateRange.forEach(date => {
                const dayLog = logs.find(l => {
                    const lDate = new Date(l.date);
                    return lDate.getDate() === date.getDate() && 
                           lDate.getMonth() === date.getMonth() && 
                           lDate.getFullYear() === date.getFullYear() &&
                           l.staff.toString() === staff._id.toString();
                });
                
                const dayTasks = tasks.filter(t => {
                    const tDate = new Date(t.date);
                    return tDate.getDate() === date.getDate() && 
                           tDate.getMonth() === date.getMonth() && 
                           tDate.getFullYear() === date.getFullYear() &&
                           t.staff.toString() === staff._id.toString();
                });

                if (dayLog && dayLog.isLeaveDay) {
                    rowData.push('Leave');
                    return;
                }

                let items = [];
                
                dayTasks.forEach(task => {
                    if (task.paperTitle) items.push(`Paper: ${task.paperTitle}`);
                    if (task.projectName) items.push(`Project: ${task.projectName}`);
                    if (task.patentTitle) items.push(`Patent: ${task.patentTitle}`);
                    if (task.bookTitle) items.push(`Book: ${task.bookTitle}`);
                    if (task.activityTitle) items.push(`Activity: ${task.activityTitle}`);
                    
                    for (let i = 1; i <= 5; i++) {
                        if (task[`additionalWorkload${i}`] && task[`additionalWorkload${i}`].trim() !== '') {
                            items.push(task[`additionalWorkload${i}`].trim());
                        }
                    }
                    
                    if (task.dynamicAnswers && typeof task.dynamicAnswers === 'object') {
                        Object.values(task.dynamicAnswers).forEach(val => {
                            if (val && typeof val === 'string' && val.trim() !== '') {
                                items.push(val.trim());
                            } else if (Array.isArray(val) && val.length > 0) {
                                items.push(val.join(', '));
                            }
                        });
                    }
                });

                items = items.filter((v, i, a) => v && a.indexOf(v) === i);

                if (items.length > 0) {
                    rowData.push(items.map((item, idx) => `${idx + 1}. ${item}`).join('\n\n'));
                } else {
                    rowData.push('Not Entered');
                }
            });

            const row = sheet.addRow(rowData);
            const bgColor = sIdx % 2 === 0 ? 'FFE0F2FE' : 'FFDCFCE7';
            
            row.eachCell((cell, colIdx) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: bgColor }
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                cell.alignment = { vertical: 'middle', wrapText: true };
                
                if (cell.value === 'Not Entered') {
                    cell.font = { italic: true, color: { argb: 'FFEF4444' } };
                }
            });
        });

        // Column widths
        sheet.getColumn(1).width = 5;
        sheet.getColumn(2).width = 25;
        sheet.getColumn(3).width = 20;
        for (let i = 4; i <= totalCols; i++) {
            sheet.getColumn(i).width = 35;
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=CFRD_Weekly_Report_${new Date().getTime()}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Excel Generation Error:', error);
        res.status(500).json({ message: 'Server error generating Excel' });
    }
};

// @desc    Generate Analytics PDF report
// @route   GET /api/reports/analytics-pdf
// @access  Private (Admin)
const generateAnalyticsPDF = async (req, res) => {
    try {
        // Gathering Analytics Data (Reflecting ALL submissions as requested)
        const [allTasks, topPerformers] = await Promise.all([
            TaskEntry.find({}).populate('staff'),
            User.find({ role: 'staff' }).sort({ totalScore: -1 }).limit(10).select('name department totalScore')
        ]);

        const overview = {
            sciPapersAccepted: 0,
            sciPapersPublished: 0,
            scopusPapersAccepted: 0,
            scopusPapersPublished: 0,
            patentPublished: 0,
            patentGrant: 0,
            conferencePapersAccepted: 0,
            conferencePapersPublished: 0,
            bookChaptersAccepted: 0,
            bookChaptersPublished: 0,
            fundingApplied: 0,
            fundingReceived: 0
        };

        allTasks.forEach(task => {
            const paperStatus = (task.paperStatus || '').toLowerCase();
            const journalType = (task.journalType || '').toUpperCase();
            const projectStatus = (task.projectStatus || '').toLowerCase();
            const patentType = (task.patentType || '').toLowerCase();
            const bookStatus = (task.bookStatus || '').toLowerCase();

            if (task.paperTitle && task.paperTitle.trim() !== '') {
                if (journalType.includes('SCI')) {
                    if (paperStatus === 'published') overview.sciPapersPublished++;
                    else if (paperStatus === 'accepted') overview.sciPapersAccepted++;
                } else if (journalType.includes('SCOPUS')) {
                    if (paperStatus === 'published') overview.scopusPapersPublished++;
                    else if (paperStatus === 'accepted') overview.scopusPapersAccepted++;
                } else if (journalType.includes('CONFERENCE')) {
                    if (paperStatus === 'published') overview.conferencePapersPublished++;
                    else if (paperStatus === 'accepted') overview.conferencePapersAccepted++;
                }
            }

            if (task.patentTitle && task.patentTitle.trim() !== '') {
                if (patentType === 'published') overview.patentPublished++;
                else if (patentType === 'granted') overview.patentGrant++;
            }

            if (task.bookTitle && task.bookTitle.trim() !== '') {
                if (bookStatus === 'published') overview.bookChaptersPublished++;
                else if (bookStatus === 'accepted' || bookStatus === 'completed') overview.bookChaptersAccepted++;
            }

            if (task.projectName && task.projectName.trim() !== '') {
                if (projectStatus === 'submitted' || projectStatus === 'applied') overview.fundingApplied++;
                else if (projectStatus === 'approved' || projectStatus === 'completed' || projectStatus === 'granted' || projectStatus === 'received') overview.fundingReceived++;
            }
        });

        const doc = new PDFDocument({ 
            layout: 'portrait', 
            margin: 40,
            size: 'A4'
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=CFRD_Analytics_Report_${new Date().getTime()}.pdf`);

        doc.pipe(res);

        // --- Header (Template Mirror) ---
        const pageWidth = doc.page.width;
        const logoPath = path.join(__dirname, '..', '..', '..', 'dawnow-frontend', 'public', 'images', 'logo-jjcet.jpg');

        let currentY = 20;

        if (fs.existsSync(logoPath)) {
            const logoWidth = 280;
            const logoX = (pageWidth - logoWidth) / 2;
            doc.image(logoPath, logoX, currentY, { width: logoWidth });
            currentY += 85; 
        }
        
        doc.fillColor('#000000').fontSize(14).font('Helvetica-Bold')
            .text('Center for Research and Development - Analytics Report', 40, currentY + 15, { align: 'center', width: pageWidth - 80 });
        
        doc.fontSize(10).font('Helvetica').fillColor('#64748b')
            .text(`Report Generated On: ${new Date().toLocaleDateString('en-GB')}`, 40, currentY + 35, { align: 'center', width: pageWidth - 80 });

        currentY += 70;

        // --- Stats Overview ---
        doc.fillColor('#fce4ec').rect(40, currentY, pageWidth - 80, 25).fill();
        doc.fillColor('#d32f2f').fontSize(11).font('Helvetica-Bold').text('Research Output Overview', 50, currentY + 7);
        currentY += 40;

        const colWidth = (pageWidth - 100) / 4;
        
        const drawGridItem = (label, sublabel, accepted, published, x, y) => {
            doc.fillColor('#475569').fontSize(7).font('Helvetica-Bold').text(label.toUpperCase(), x, y);
            doc.fillColor('#94a3b8').fontSize(6).font('Helvetica').text(sublabel.toUpperCase(), x, y + 10);
            doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text(`${accepted}`, x, y + 20);
            doc.fillColor('#94a3b8').fontSize(10).font('Helvetica').text('/', x + 18, y + 21);
            doc.fillColor('#16a34a').fontSize(14).font('Helvetica-Bold').text(`${published}`, x + 25, y + 20);
        };

        const drawSingleItem = (label, value, x, y) => {
            doc.fillColor('#475569').fontSize(7).font('Helvetica-Bold').text(label.toUpperCase(), x, y);
            doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text(value.toString(), x, y + 20);
        };

        // Row 1
        drawGridItem('sci papers', 'accepted / published', overview.sciPapersAccepted, overview.sciPapersPublished, 50, currentY);
        drawGridItem('Scopus paper', 'accepted / published', overview.scopusPapersAccepted, overview.scopusPapersPublished, 50 + colWidth, currentY);
        drawSingleItem('patent published', overview.patentPublished, 50 + (colWidth * 2), currentY);
        drawSingleItem('patent grant', overview.patentGrant, 50 + (colWidth * 3), currentY);

        currentY += 45;
        doc.strokeColor('#f1f5f9').lineWidth(0.5).moveTo(50, currentY).lineTo(pageWidth - 50, currentY).stroke();
        currentY += 15;

        // Row 2
        drawGridItem('conference paper', 'accepted / published', overview.conferencePapersAccepted, overview.conferencePapersPublished, 50, currentY);
        drawGridItem('book/book chapter', 'accepted / published', overview.bookChaptersAccepted, overview.bookChaptersPublished, 50 + colWidth, currentY);
        drawSingleItem('funding Applied', overview.fundingApplied, 50 + (colWidth * 2), currentY);
        drawSingleItem('Funding received', overview.fundingReceived || 'nil', 50 + (colWidth * 3), currentY);

        currentY += 50;

        // --- Top Performers List ---
        doc.fillColor('#fce4ec').rect(40, currentY, pageWidth - 80, 25).fill();
        doc.fillColor('#000000').fontSize(11).font('Helvetica-Bold').text('Current Top Research Performers', 50, currentY + 7);
        currentY += 35;

        // Table Header
        doc.fillColor('#f1f5f9').rect(40, currentY, pageWidth - 80, 20).fill();
        doc.fillColor('#64748b').fontSize(8).font('Helvetica-Bold');
        doc.text('Rank', 50, currentY + 6);
        doc.text('Name', 100, currentY + 6);
        doc.text('Department', 280, currentY + 6);
        doc.text('Score', 480, currentY + 6);
        currentY += 20;

        topPerformers.forEach((p, i) => {
            doc.fillColor(i % 2 === 0 ? '#ffffff' : '#f8fafc').rect(40, currentY, pageWidth - 80, 25).fill();
            doc.fillColor('#334155').fontSize(9).font('Helvetica');
            doc.text(`${i + 1}`, 50, currentY + 8);
            
            const staffName = p.name || 'Unknown Staff';
            const displayName = staffName.toLowerCase().includes('dr.') ? staffName : `Dr. ${staffName}`;
            doc.font('Helvetica-Bold').text(displayName, 100, currentY + 8);
            
            doc.font('Helvetica').text(p.department || 'General', 280, currentY + 8);
            
            doc.fillColor('#16a34a').font('Helvetica-Bold').text(`${p.totalScore} pts`, 480, currentY + 8);
            currentY += 25;
        });

        // --- Footer ---
        const footerY = doc.page.height - 50;
        doc.fontSize(8).fillColor('#94a3b8').text('This is a computer-generated report from DAW NOW Portal.', 40, footerY, { align: 'center', width: pageWidth - 80 });

        doc.end();
    } catch (error) {
        console.error('Analytics PDF Error:', error);
        res.status(500).json({ message: 'Server error generating Analytics PDF' });
    }
};

module.exports = { generatePDF, generateExcel, generateAnalyticsPDF };
