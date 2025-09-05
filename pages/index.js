import Head from 'next/head';
import { useState } from 'react'; // Import useState

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for mobile menu

  return (
    <div className="bg-gray-100 min-h-screen">
      <Head>
        <title>Phòng khám XYZ</title>
        <meta name="description" content="Hệ thống quản lý phòng khám" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* --- Header Section --- */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-blue-600">Phòng khám XYZ</h1>
          
          {/* --- Desktop Nav --- */}
          <nav className="hidden md:flex space-x-1 lg:space-x-3">
            <a href="#" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Trang chủ</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Lịch hẹn</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Bệnh nhân</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Thuốc</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Cài đặt</a>
          </nav>

          {/* --- Mobile Menu Button --- */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-blue-600 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* --- Mobile Menu --- */}
        {isMenuOpen && (
          <div className="md:hidden bg-white">
            <a href="#" className="block text-gray-600 hover:text-blue-600 hover:bg-gray-100 px-6 py-3">Trang chủ</a>
            <a href="#" className="block text-gray-600 hover:text-blue-600 hover:bg-gray-100 px-6 py-3">Lịch hẹn</a>
            <a href="#" className="block text-gray-600 hover:text-blue-600 hover:bg-gray-100 px-6 py-3">Bệnh nhân</a>
            <a href="#" className="block text-gray-600 hover:text-blue-600 hover:bg-gray-100 px-6 py-3">Thuốc</a>
            <a href="#" className="block text-gray-600 hover:text-blue-600 hover:bg-gray-100 px-6 py-3">Cài đặt</a>
          </div>
        )}
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* --- Cards Section --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Lịch hẹn */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-2">Lịch hẹn hôm nay</h2>
            <p className="text-gray-700">Bạn có <span className="font-bold text-blue-500">5</span> cuộc hẹn hôm nay.</p>
            <button className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">Xem chi tiết</button>
          </div>

          {/* Card 2: Bệnh nhân mới */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-2">Bệnh nhân mới</h2>
            <p className="text-gray-700">Có <span className="font-bold text-green-500">2</span> bệnh nhân mới trong tuần.</p>
            <button className="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">Thêm bệnh nhân</button>
          </div>

          {/* Card 3: Báo cáo */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-2">Báo cáo doanh thu</h2>
            <p className="text-gray-700">Doanh thu tháng này: <span className="font-bold text-red-500">15.000.000 VNĐ</span></p>
            <button className="mt-4 w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">Xem báo cáo</button>
          </div>
        </div>

        {/* --- Table Section --- */}
        <div className="mt-8 bg-white p-4 md:p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Danh sách bệnh nhân chờ</h2>
          {/* --- Responsive Table Wrapper --- */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-500">
                  <th className="py-3 px-4 font-medium">STT</th>
                  <th className="py-3 px-4 font-medium">Họ và tên</th>
                  <th className="py-3 px-4 font-medium">Giờ khám</th>
                  <th className="py-3 px-4 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4">1</td>
                  <td className="py-3 px-4">Nguyễn Văn A</td>
                  <td className="py-3 px-4">09:00 AM</td>
                  <td className="py-3 px-4"><span className="bg-yellow-400 text-white px-2 py-1 rounded-full text-xs font-semibold">Chờ khám</span></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4">2</td>
                  <td className="py-3 px-4">Trần Thị B</td>
                  <td className="py-3 px-4">09:30 AM</td>
                  <td className="py-3 px-4"><span className="bg-yellow-400 text-white px-2 py-1 rounded-full text-xs font-semibold">Chờ khám</span></td>
                </tr>
                {/* More rows */}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}