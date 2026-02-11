// 0、常用的坐标系
// 笛卡尔坐标：new Cesium.Cartesian3(x, y, z)  443621.9353276883
// 弧度坐标：new Cesium.Cartographic(longitude, latitude, height) -1.657287975770561  
// 经纬度： Cesium.Cartesian3.fromDegrees(longitude, latitude, height)  120  

// 1、heading、pitch、roll
// 偏航（heading），即机头朝左右摇摆 
// 俯仰(pitch)，机头上下摇摆
// 滚转(roll)，机身绕中轴线旋转

// 2、角度转弧度互相转换
// 【1】角度转弧度：var radius = Cesium.Math.toRadians(90);
// 【2】弧度转角度：var angle = Cesium.Math.toDegrees(1.5707963267948966);


// 加载离线地形
// viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
//     url: 'http://localhost/dem_30m/',
// });
// 根据xy，可以获得高度，贴地用
// var cartographic=Cesium.Cartographic.fromDegrees(88.01574604728957, 31.464332955079115);
// var posi = new Cesium.Cartographic(cartographic.longitude, cartographic.latitude)
// var height21 =viewer.scene.globe.getHeight(posi)