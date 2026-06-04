
import React, { useState } from 'react';

function Tabs({ defaultValue, children }) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  // Find TabsList and TabsContent components
  const tabsList = React.Children.toArray(children).find(
    child => child.type === TabsList
  );
  
  const tabsContent = React.Children.toArray(children).find(
    child => child.type === TabsContent
  );
  
  // Clone TabsList with activeTab state and setter
  const clonedTabsList = React.cloneElement(tabsList, {
    activeTab,
    setActiveTab,
  });
  
  // Clone TabsContent with activeTab state
  const clonedTabsContent = React.cloneElement(tabsContent, {
    activeTab,
  });
  
  return (
    <div className="tabs">
      {clonedTabsList}
      {clonedTabsContent}
    </div>
  );
}

function TabsList({ children, activeTab, setActiveTab }) {
  return (
    <div className="tabs-list">
      {React.Children.map(children, child => {
        if (child.type === TabsTrigger) {
          return React.cloneElement(child, {
            isActive: activeTab === child.props.value,
            onSelect: () => setActiveTab(child.props.value),
          });
        }
        return child;
      })}
    </div>
  );
}

function TabsTrigger({ children, value, isActive, onSelect }) {
  return (
    <button 
      className={`tab-trigger ${isActive ? 'active' : ''}`} 
      onClick={onSelect}
    >
      {children}
    </button>
  );
}

function TabsContent({ children, activeTab }) {
  return (
    <div>
      {React.Children.map(children, child => {
        if (child.type === TabContent) {
          return React.cloneElement(child, {
            isActive: activeTab === child.props.value,
          });
        }
        return null;
      })}
    </div>
  );
}

function TabContent({ children, value, isActive }) {
  if (!isActive) return null;
  
  return (
    <div className={`tab-content ${isActive ? 'active' : ''}`}>
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, TabContent };