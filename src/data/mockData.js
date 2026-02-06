export const SHELTERS = [
    {
      id: 1,
      name: 'Happy Paws Rescue (Hà Nội)',
      region: 'Miền Bắc',
      address: '123 Lạc Long Quân, Tây Hồ, Hà Nội',
      phone: '0905-123-456',
      email: 'contact@happypaws.vn',
      image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
      description: 'Chuyên cứu hộ và phục hồi chức năng chó mèo tại khu vực phía Bắc từ năm 2010. Chúng tôi tập trung vào y tế và tìm mái ấm vĩnh viễn.',
      animalCount: 45
    },
    {
      id: 2,
      name: 'Trạm Cứu Hộ Động Vật Sài Gòn (SARC)',
      region: 'Miền Nam',
      address: '45 Thảo Điền, Quận 2, TP.HCM',
      phone: '0988-888-999',
      email: 'rescue@sarc.vn',
      image: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?auto=format&fit=crop&w=800&q=80',
      description: 'Trạm cứu hộ lớn nhất TP.HCM, tập trung giảm thiểu số lượng chó mèo hoang thông qua triệt sản và giáo dục cộng đồng.',
      animalCount: 120
    },
    {
      id: 3,
      name: 'Danang Pet Care',
      region: 'Miền Trung',
      address: '78 Lê Duẩn, Hải Châu, Đà Nẵng',
      phone: '0236-333-444',
      email: 'help@danangpetcare.org',
      image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
      description: 'Trạm cứu hộ cộng đồng tại trung tâm Đà Nẵng, tập trung vào chó mèo bị thương và bị bỏ rơi ở các khu du lịch.',
      animalCount: 30
    },
    {
      id: 4,
      name: 'Cứu Hộ Vùng Cao Sapa',
      region: 'Miền Bắc',
      address: 'Km 5, Đèo Ô Quy Hồ, Sapa',
      phone: '0912-345-678',
      email: 'sapa@mountainrescue.org',
      image: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=800&q=80',
      description: 'Cứu hộ động vật tại các vùng núi hẻo lánh Lào Cai. Chúng tôi cung cấp nơi trú ẩn tránh rét và hỗ trợ y tế.',
      animalCount: 15
    },
    {
      id: 5,
      name: 'Trạm Mèo Đồng Bằng Sông Cửu Long',
      region: 'Miền Nam',
      address: 'Bến Ninh Kiều, Cần Thơ',
      phone: '0939-111-222',
      email: 'mekongcats@rescue.vn',
      image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
      description: 'Nơi trú ẩn an toàn dành riêng cho mèo tại vùng ĐBSCL. Môi trường tự do không lồng chuồng.',
      animalCount: 65
    },
    {
      id: 6,
      name: 'Cứu Hộ Cố Đô Huế',
      region: 'Miền Trung',
      address: 'Phường Vỹ Dạ, TP. Huế',
      phone: '0234-555-666',
      email: 'hue@ancientrescue.com',
      image: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=800&q=80',
      description: 'Gìn giữ lòng trắc ẩn của vùng đất cố đô bằng cách giúp đỡ mọi động vật gặp khó khăn.',
      animalCount: 22
    }
  ];
  
  export const ANIMALS = [
    // Happy Paws (ID 1)
    { id: 101, shelterId: 1, name: 'Bobert', breed: 'Lai Golden', type: 'Chó', status: 'Sẵn sàng', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80', description: 'Rất năng động và thích chơi ném bóng.' },
    { id: 102, shelterId: 1, name: 'Mimi', breed: 'Mèo Mướp', type: 'Mèo', status: 'Sẵn sàng', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=500&q=80', description: 'Thích ngủ trưa và tắm nắng.' },
    { id: 103, shelterId: 1, name: 'Rex', breed: 'Becgie Đức', type: 'Chó', status: 'Chờ duyệt', image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=500&q=80', description: 'Người bảo vệ trung thành, cần sân rộng.' },
    { id: 104, shelterId: 1, name: 'Lulu', breed: 'Poodle', type: 'Chó', status: 'Sẵn sàng', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=500&q=80', description: 'Không rụng lông và rất thông minh.' },
    { id: 105, shelterId: 1, name: 'Kiki', breed: 'Corgi', type: 'Chó', status: 'Sẵn sàng', image: 'https://images.unsplash.com/photo-1575425186775-b8de9a427e67?auto=format&fit=crop&w=500&q=80', description: 'Chân ngắn, trái tim to lớn.' },
    
    // Saigon Shelter (ID 2)
    { id: 201, shelterId: 2, name: 'Tiger', breed: 'Bulldog', type: 'Chó', status: 'Sẵn sàng', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=500&q=80', description: 'Gã khổng lồ hiền lành, yêu trẻ con.' },
    { id: 202, shelterId: 2, name: 'Snowball', breed: 'Mèo Ba Tư', type: 'Mèo', status: 'Khẩn cấp', image: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=500&q=80', description: 'Cần chải lông hàng ngày và nhiều tình thương.' },
    { id: 203, shelterId: 2, name: 'Charlie', breed: 'Beagle', type: 'Chó', status: 'Đã được nhận', image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=500&q=80', description: 'Thích đồ ăn và đánh hơi giỏi.' },
    { id: 204, shelterId: 2, name: 'Luna', breed: 'Mèo Đen', type: 'Mèo', status: 'Sẵn sàng', image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=500&q=80', description: 'Hơi nhút nhát nhưng rất ngọt ngào khi đã quen.' },
    { id: 205, shelterId: 2, name: 'Max', breed: 'Husky', type: 'Chó', status: 'Sẵn sàng', image: 'https://images.unsplash.com/photo-1547407139-4c925d450616?auto=format&fit=crop&w=500&q=80', description: 'Rất hay nói và cần vận động nhiều.' },
    { id: 206, shelterId: 2, name: 'Cooper', breed: 'Labrador', type: 'Chó', status: 'Sẵn sàng', image: 'https://images.unsplash.com/photo-1591769225440-811ad7d6eca6?auto=format&fit=crop&w=500&q=80', description: 'Giống chó thân thiện điển hình.' },
  
    // Danang (ID 3)
    { id: 301, shelterId: 3, name: 'Coco', breed: 'Shiba Inu', type: 'Chó', status: 'Sẵn sàng', image: 'https://images.unsplash.com/photo-1504595403659-9088ce801e29?auto=format&fit=crop&w=500&q=80', description: 'Lém lỉnh và độc lập.' },
    { id: 302, shelterId: 3, name: 'Mango', breed: 'Mèo Vàng', type: 'Mèo', status: 'Sẵn sàng', image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=500&q=80', description: 'Chú mèo thân thiện nhất bạn từng gặp.' },
    { id: 303, shelterId: 3, name: 'Bella', breed: 'Phốc Sóc', type: 'Chó', status: 'Sẵn sàng', image: 'https://images.unsplash.com/photo-1563496030553-df9c301c3795?auto=format&fit=crop&w=500&q=80', description: 'Cục bông di động vui vẻ.' },
    
    // Mountain Rescue (ID 4)
    { id: 401, shelterId: 4, name: 'Bear', breed: 'Chó Cỏ', type: 'Chó', status: 'Đang điều trị', image: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=500&q=80', description: 'Cứu từ đợt rét đậm, đang hồi phục tốt.' },
    { id: 402, shelterId: 4, name: 'Rocky', breed: 'Chó Lai', type: 'Chó', status: 'Sẵn sàng', image: 'https://images.unsplash.com/photo-1444212477490-ca407925329e?auto=format&fit=crop&w=500&q=80', description: 'Thích chạy nhảy trên đồng cỏ.' },
  
    // Mekong (ID 5)
    { id: 501, shelterId: 5, name: 'Whiskers', breed: 'Maine Coon', type: 'Mèo', status: 'Sẵn sàng', image: 'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&w=500&q=80', description: 'Mèo khổng lồ với tâm hồn dịu dàng.' },
    { id: 502, shelterId: 5, name: 'Nala', breed: 'Xiêm', type: 'Mèo', status: 'Sẵn sàng', image: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=500&q=80', description: 'Hay nói và thích leo trèo.' },
    { id: 503, shelterId: 5, name: 'Simba', breed: 'Mèo Vàng', type: 'Mèo', status: 'Sẵn sàng', image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=500&q=80', description: 'Vua của trạm cứu hộ.' },
    { id: 504, shelterId: 5, name: 'Mochi', breed: 'Mèo Trắng', type: 'Mèo', status: 'Sẵn sàng', image: 'https://images.unsplash.com/photo-1517331156700-6c24382e5688?auto=format&fit=crop&w=500&q=80', description: 'Trắng tinh khôi và đầy tình yêu.' },
  
    // Hue (ID 6)
    { id: 601, shelterId: 6, name: 'Lotus', breed: 'Đốm', type: 'Chó', status: 'Sẵn sàng', image: 'https://images.unsplash.com/photo-1605335889370-15f53229b4e5?auto=format&fit=crop&w=500&q=80', description: 'Cần chủ nhân năng động thích chạy bộ.' },
    { id: 602, shelterId: 6, name: 'Pepper', breed: 'Greyhound', type: 'Chó', status: 'Sẵn sàng', image: 'https://images.unsplash.com/photo-1554522437-128a1e2f3d2f?auto=format&fit=crop&w=500&q=80', description: 'Chạy nhanh, ngủ kỹ.' }
  ];
