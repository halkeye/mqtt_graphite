const graphite = require('graphite');
const mqtt = require('mqtt');
const dns = require('dns');
const fs = require('fs');

const search = fs.readFileSync('/etc/resolv.conf', {encoding: 'utf8'}).split(/\n|\r/)
  .filter(function (line) {
    return line.includes('search');
  })
  .map(function (line) {
    return line.split(/\s+/)[1];
  }).shift();

const graphiteClient = graphite.createClient(`plaintext://${process.env.GRAPHITE_SERVER || 'localhost'}:2003/`);
dns.resolveSrv(`_mqtt._tcp.${search}`, function (err, addresses) {
  if (err) { throw err; }
  const address = addresses.shift();
  const mqttClient = mqtt.connect(`mqtt://${address.name}:${address.port}`, { });

  mqttClient.on('error', function (err) {
    throw err;
  });

  mqttClient.on('connect', function () {
    mqttClient.subscribe('openhab/items/#');
  });

  mqttClient.on('message', function (topic, message) {
    let json;
    try { json = JSON.parse(message.toString()); } catch (e) { return; }
    switch (json.name) {
      case 'zwave_device_72167e2d_node13_sensor_binary':
        json.name = 'front_door.sensor';
        break;
      case 'zwave_device_72167e2d_node13_battery_level':
        json.name = 'front_door.battery';
        break;
      case 'zwave_device_72167e2d_node6_switch_binary':
        json.name = 'front_left_lamp.switch';
        break;
      case 'zwave_device_72167e2d_node4_switch_binary':
        json.name = 'front_right_lamp.switch';
        break;
      case 'zwave_device_72167e2d_node5_switch_binary':
        json.name = 'kitchen_lamp.switch';
        break;
      case 'zwave_device_72167e2d_node7_switch_binary':
        json.name = 'living_room_lamp.switch';
        break;
      case 'network_device_172_16_10_2_online':
        json.name = 'odin.online';
        break;
      case 'network_device_172_16_10_177_online':
        json.name = 'gavin_phone.online';
        break;
      case 'zwave_device_72167e2d_node8_switch_dimmer':
        json.name = 'patio.switch';
        break;
      case 'zwave_device_72167e2d_node3_switch_binary':
        json.name = 'real_lamp.switch';
        break;
      case 'zwave_device_72167e2d_node10_sensor_binary':
        json.name = 'front_door_motion.sensor';
        break;
      case 'zwave_device_72167e2d_node10_sensor_temperature':
        json.name = 'front_door_motion.temperature';
        break;
      case 'yahooweather_weather_burnaby_temperature':
        json.name = 'outside.temperature';
        break;
      case 'zwave_device_72167e2d_node10_battery_level':
        json.name = 'front_door_motion.battery';
        break;
      default:
        console.log(json);
        return;
    }
    graphiteClient.write({ [`openhab.${json.name}`]: json.value });
  });
});
