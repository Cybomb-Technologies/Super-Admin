import React from 'react';

const Placeholder = ({ title }) => (
    <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
        <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-xl">
            <p className="text-amber-400">
                The <strong>{title}</strong> page code is currently being integrated or is pending from the Startup Builder panel.
            </p>
        </div>
    </div>
);

export default Placeholder;
