import React, { createContext, useContext, useState, useEffect } from 'react';

const HubNetworkContext = createContext();

export const HubNetworkProvider = ({ children }) => {
  const [acceptedRequests, setAcceptedRequests] = useState({});
  const [hubsByDistrict, setHubsByDistrict] = useState({});

  // Load data from localStorage on initial load
  useEffect(() => {
    const savedData = localStorage.getItem('hubNetworkData');
    if (savedData) {
      const { acceptedRequests: savedRequests, hubsByDistrict: savedHubs } = JSON.parse(savedData);
      setAcceptedRequests(savedRequests || {});
      setHubsByDistrict(savedHubs || {});
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    const dataToSave = {
      acceptedRequests,
      hubsByDistrict
    };
    localStorage.setItem('hubNetworkData', JSON.stringify(dataToSave));
  }, [acceptedRequests, hubsByDistrict]);

  const addAcceptedRequest = (request) => {
    const { hubDistrict } = request;
    
    setAcceptedRequests(prev => ({
      ...prev,
      [request.id]: {
        ...request,
        status: 'accepted',
        acceptedAt: new Date().toISOString()
      }
    }));

    setHubsByDistrict(prev => ({
      ...prev,
      [hubDistrict]: [
        ...(prev[hubDistrict] || []),
        {
          requestId: request.id,
          customerName: request.customerName,
          orderDate: request.orderDate,
          totalAmount: request.totalAmount,
          status: 'accepted'
        }
      ]
    }));
  };

  const getRequestsByDistrict = (district) => {
    return hubsByDistrict[district] || [];
  };

  const getAllDistrictsWithRequests = () => {
    return Object.entries(hubsByDistrict).map(([district, requests]) => ({
      district,
      requestCount: requests.length,
      totalAmount: requests.reduce((sum, req) => sum + (req.totalAmount || 0), 0)
    }));
  };

  return (
    <HubNetworkContext.Provider
      value={{
        acceptedRequests,
        hubsByDistrict,
        addAcceptedRequest,
        getRequestsByDistrict,
        getAllDistrictsWithRequests
      }}
    >
      {children}
    </HubNetworkContext.Provider>
  );
};

export const useHubNetwork = () => {
  const context = useContext(HubNetworkContext);
  if (!context) {
    throw new Error('useHubNetwork must be used within a HubNetworkProvider');
  }
  return context;
};

export default HubNetworkContext;
