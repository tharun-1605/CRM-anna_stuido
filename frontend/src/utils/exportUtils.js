export const exportToCSV = (data, filename) => {
  if (!data || !data.length) {
    alert("No data available to export.");
    return;
  }
  const headers = Object.keys(data[0]).join(',');
  const csvRows = data.map(row => {
    return Object.values(row).map(val => {
      const strVal = String(val ?? '');
      return `"${strVal.replace(/"/g, '""')}"`;
    }).join(',');
  });
  
  const csvContent = [headers, ...csvRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
