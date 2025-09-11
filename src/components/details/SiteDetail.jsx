import React, { useState } from 'react';
import { Info, Image, CheckSquare2 } from 'lucide-react';
import SiteInfoTab from './SiteInfoTab.jsx';
import PhotosTab from './PhotosTab.jsx';
import ChecklistTab from './ChecklistTab.jsx';

const SiteDetail = ({ site, onUpdateSite, teams, checklistTemplates, colors, onUpdateSiteStatus, statusColumns }) => {
    const [activeTab, setActiveTab] = useState('info');

    const TabButton = ({ tabName, icon, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex-1 flex items-center justify-center gap-2 p-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tabName
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
        >
            {icon}
            {label}
        </button>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'info':
                return <SiteInfoTab site={site} teams={teams} colors={colors} onUpdateSite={onUpdateSite} onUpdateSiteStatus={onUpdateSiteStatus} statusColumns={statusColumns} />;
            case 'photos':
                return <PhotosTab site={site} colors={colors} onUpdateSite={onUpdateSite} />;
            case 'checklist':
                return <ChecklistTab site={site} checklistTemplates={checklistTemplates} colors={colors} onUpdateSite={onUpdateSite} />;
            default:
                return null;
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                    <TabButton tabName="info" icon={<Info size={16} />} label="Infos" />
                    <TabButton tabName="photos" icon={<Image size={16} />} label="Photos" />
                    <TabButton tabName="checklist" icon={<CheckSquare2 size={16} />} label="Checklist" />
                </nav>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default SiteDetail;
