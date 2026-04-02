import React from 'react';

const BannerBox = () => {
    return (
        <div className="banner-box w-fit max-w-full mx-auto my-4 bg-white p-2 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-500 overflow-hidden transform hover:-translate-y-1">
            <img 
                src="/images/logo-jjcet.jpg" 
                alt="JJ College Banner" 
                className="h-40 w-auto object-contain rounded-xl"
                loading="lazy"
            />
        </div>
    );
};

export default BannerBox;
