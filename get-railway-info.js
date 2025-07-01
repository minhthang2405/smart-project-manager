// Get Railway database connection info
console.log('Railway Database Connection Info:');
console.log('================================');

// You need to get these from Railway Dashboard
// Go to: Railway → MySQL Service → Connect tab

const railwayInfo = `
HOST: junction.proxy.rlwy.net (example)
PORT: 12345 (example)  
USERNAME: root
PASSWORD: [get from Railway]
DATABASE: railway

Connection String format:
mysql://root:password@junction.proxy.rlwy.net:12345/railway

For HeidiSQL:
- Network type: MariaDB or MySQL (TCP/IP)
- Hostname/IP: junction.proxy.rlwy.net
- User: root  
- Password: [your railway password]
- Port: [your railway port]
- Database: railway (or smartpm if you created it)
`;

console.log(railwayInfo);
