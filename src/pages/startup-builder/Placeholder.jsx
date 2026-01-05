import React from 'react';

const Placeholder = ({ title }) => (
    <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-yellow-700">
                The <strong>{title}</strong> page code is currently being integrated or is pending from the Startup Builder panel.
            </p>
        </div>
    </div>
);

export default Placeholder;
