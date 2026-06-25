export const getRiskLevel = (portNumber: number, serviceName: string): string => {
  const service = (serviceName || '').toLowerCase();
  
  if (portNumber === 23 || service === 'telnet') {
    return 'Critical';
  }
  if (portNumber === 21 || service === 'ftp' || portNumber === 445 || service === 'microsoft-ds' || service === 'smb') {
    return 'High';
  }
  if (portNumber === 3389 || service === 'ms-wbt-server' || service === 'rdp') {
    return 'Medium';
  }
  if (portNumber === 22 || service === 'ssh' || portNumber === 80 || service === 'http') {
    return 'Low';
  }
  if (portNumber === 443 || service === 'https' || service === 'ssl/http') {
    return 'Informational';
  }
  
  return 'Unknown';
};
