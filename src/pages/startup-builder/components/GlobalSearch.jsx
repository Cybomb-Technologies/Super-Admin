import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const GlobalSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Implement global search logic here
            console.log('Searching for:', searchQuery);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        type="text"
                        placeholder="Search across templates, users, categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10 py-3 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                    />
                    {searchQuery && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearSearch}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
                <Button
                    type="submit"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700"
                >
                    Search
                </Button>
            </form>
        </div>
    );
};

export default GlobalSearch;
