import * as signalR from '@microsoft/signalr';
import toast from 'react-hot-toast';

/**
 * SIGNALR SERVICE - QUẢN LÝ THÔNG BÁO REAL-TIME
 */

let connection = null;

/**
 * Khởi tạo và thiết lập lắng nghe thông báo
 */
export const startNotificationConnection = async (shelterId) => {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    console.log('SignalR is already connected');
    return connection;
  }

  // Lấy URL hub từ environment, mặc định là production URL nếu ko có
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api-tramcuuho.render.com';
  const hubUrl = `${API_BASE_URL}/notificationHub`;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => localStorage.getItem('accessToken')
    })
    .withAutomaticReconnect()
    .build();

  try {
    await connection.start();
    console.log('SignalR connected successfully');

    // Sau khi connection.start() thành công, hãy gọi connection.invoke("JoinShelterGroup", shelterId)
    if (shelterId) {
      await connection.invoke('JoinShelterGroup', Number(shelterId));
      console.log(`Joined shelter group: ${shelterId}`);
    }

    // Lắng nghe sự kiện: connection.on("ReceiveNotification", (data) => { ... })
    connection.on('ReceiveNotification', (data) => {
      console.log('New notification received:', data);
      
      // Dữ liệu trả về từ Hub: { Type: "NewAdoptionRequest", Message: string, PetID: number, Timestamp: DateTime }
      if (data.Type === 'NewAdoptionRequest') {
        toast.success(`Có yêu cầu nhận nuôi mới cho bé [${data.PetName || 'Pet'}]!`, {
          duration: 5000,
          position: 'top-right',
        });
      } else {
        toast(data.Message || 'Có thông báo mới!', {
          icon: '🔔',
          duration: 4000,
        });
      }
    });

    return connection;
  } catch (err) {
    console.error('SignalR connection error: ', err);
    // Trả về null để frontend biết ko kết nối được (nhưng withAutomaticReconnect sẽ tự thử lại)
    return null;
  }
};

/**
 * Dừng kết nối SignalR
 */
export const stopConnection = async () => {
  if (connection) {
    try {
      await connection.stop();
      console.log('SignalR connection stopped');
    } catch (err) {
      console.error('Error stopping SignalR connection: ', err);
    }
  }
};

export default connection;
