import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

interface LoginLog {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  loginTime: string;
  ip: string;
  city: string;
  region: string;
  country: string;
  org: string;
  latitude: number;
  longitude: number;
  deviceInfo: {
    os: string;
    browser: string;
    language: string;
    screenResolution: string;
    timeZone: string;
  };
}

const LoginLogTable: React.FC = () => {
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLoginLogs = async () => {
      try {
        const response = await axios.get<LoginLog[]>('/api/login-logs');
        setLoginLogs(response.data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch login logs');
        setIsLoading(false);
      }
    };

    fetchLoginLogs();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-yellow-400">Login Log</h1>
      <div className="rounded-lg shadow">
        <div className="overflow-y-auto" style={{ height: '70vh' }}> {/* Adjust height as needed */}
          <table className="w-full table-fixed">
            <thead className="bg-purple-700 sticky top-0">
              <tr>
                <th className="w-1/7 px-4 py-3 text-left text-xs font-medium text-yellow-400 uppercase">Login Time</th>
                <th className="w-1/7 px-4 py-3 text-left text-xs font-medium text-yellow-400 uppercase">User</th>
                <th className="w-1/7 px-4 py-3 text-left text-xs font-medium text-yellow-400 uppercase">IP</th>
                <th className="w-1/7 px-4 py-3 text-left text-xs font-medium text-yellow-400 uppercase">Location</th>
                <th className="w-1/7 px-4 py-3 text-left text-xs font-medium text-yellow-400 uppercase">Organization</th>
                <th className="w-1/7 px-4 py-3 text-left text-xs font-medium text-yellow-400 uppercase">Coordinates</th>
                <th className="w-1/7 px-4 py-3 text-left text-xs font-medium text-yellow-400 uppercase">Device Info</th>
              </tr>
            </thead>
            <tbody className="bg-purple-600 divide-y divide-purple-500">
              {loginLogs.map((log) => (
                <tr key={log._id} className="hover:bg-purple-500 transition-colors">
                  <td className="px-4 py-4 text-sm text-white break-words">
                    {format(new Date(log.loginTime), 'yyyy-MM-dd HH:mm:ss')}
                  </td>
                  <td className="px-4 py-4 text-sm text-white break-words">
                    {log.user}
                  </td>
                  <td className="px-4 py-4 text-sm text-white break-words">{log.ip}</td>
                  <td className="px-4 py-4 text-sm text-white break-words">
                    {`${log.city}, ${log.region}, ${log.country}`}
                  </td>
                  <td className="px-4 py-4 text-sm text-white break-words">{log.org}</td>
                  <td className="px-4 py-4 text-sm text-white break-words">
                    {`${log.latitude}, ${log.longitude}`}
                  </td>
                  <td className="px-4 py-4 text-sm text-white break-words">
                    <div>{`OS: ${log.deviceInfo.os}`}</div>
                    <div>{`Browser: ${log.deviceInfo.browser}`}</div>
                    <div>{`Language: ${log.deviceInfo.language}`}</div>
                    <div>{`Screen: ${log.deviceInfo.screenResolution}`}</div>
                    <div>{`Timezone: ${log.deviceInfo.timeZone}`}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LoginLogTable;
