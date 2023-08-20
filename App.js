import React, { Component } from "react";
import {
  Text,
  View,
  FlatList,
  Platform,
  Alert,
  PermissionsAndroid,
  LayoutAnimation,
  StatusBar,
  SafeAreaView,
  TouchableNativeFeedback,
} from "react-native";
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BleHelper from "./src/BleHelper";
import BleProtocol from "./src/BleProtocol";

//Make sure that there is only one instance of BleManager globally, and the BleModule class holds Bluetooth connection information
global.BluetoothManager = new BleHelper();
global.BluetoothProtocol = new BleProtocol();

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      availableDevices: [],
      scaning: false,
      isConnected: false,
      connectedPeripheral: [], // detailed object of connected peripheral.
      connectedDevice: [], // Connected Device from Availabel devices list.
      isDialogVisible: false,
    };

    this.tempDevices = new Map();

  }

  //////////////////////////////////

  componentDidMount() {
    StatusBar.setBarStyle("dark-content");
    Platform.OS === 'android' && StatusBar.setBackgroundColor('transparent');
    StatusBar.setTranslucent(true);
    
    BluetoothManager.start();
    this.discoverPeripheralListener = BluetoothManager.addListener(
      "BleManagerDiscoverPeripheral",
      this.handleDiscoverPeripheral
    );
    this.updateStateListener = BluetoothManager.addListener(
      "BleManagerDidUpdateState",
      this.handleUpdateState
    );
    this.stopScanListener = BluetoothManager.addListener(
      "BleManagerStopScan",
      this.handleStopScan
    );
    this.connectPeripheralListener = BluetoothManager.addListener(
      "BleManagerConnectPeripheral",
      this.handleConnectPeripheral
    );
    this.disconnectPeripheralListener = BluetoothManager.addListener(
      "BleManagerDisconnectPeripheral",
      this.handleDisconnectPeripheral
    );
    this.updateValueListener = BluetoothManager.addListener(
      "BleManagerDidUpdateValueForCharacteristic",
      this.handleUpdateValue
    );
  }

  checkPermissionAndProceed = () => {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
        if (result) {
          this.scan();
        } else {
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
            if (result) {
              this.scan();
            } else {

              this.alert("Permission needed");
            }
          });
        }
      });
    } else {
      this.scan();
    }
  }

  componentWillUnmount() {
    this.updateStateListener.remove();
    this.stopScanListener.remove();
    this.discoverPeripheralListener.remove();
    this.connectPeripheralListener.remove();
    this.disconnectPeripheralListener.remove();
    this.updateValueListener.remove();
    if (this.state.isConnected) {
      BluetoothManager.disconnect(); //Disconnect bluetooth on exit
    }
  }

  /////////////////////////////////////////////

  //bluetooth status change
  handleUpdateState = (args) => {
    BluetoothManager.bluetoothState = args.state;
    if (args.state == "on") {
      this.checkPermissionAndProceed();
    }
  };

  //Scan end monitoring
  handleStopScan = () => {
    this.setState({ scaning: false });
    console.log("StOPPED");
  };
  //Search for a new device to monitor
  handleDiscoverPeripheral = (dataa) => {
    let id;
    let macAddress;
    if (Platform.OS == "android") {
      macAddress = dataa.id;
      id = macAddress;
    } else {
      macAddress = BluetoothManager.getMacAddressFromIOS(dataa);
      id = dataa.id;
    }
    this.tempDevices.set(dataa.id, dataa);
    this.setState({ availableDevices: [...this.tempDevices.values()] });
  };

  //Bluetooth device is connected
  handleConnectPeripheral = (args) => {
  };

  //Bluetooth device disconnected
  handleDisconnectPeripheral = (args) => {
    let newData = [...this.tempDevices.values()];
    this.setState({
      availableDevices: newData,
      isConnected: false
    });
  };

  //new data received
  handleUpdateValue = (data) => {
    //Some Bluetooth devices ios receive lowercase hexadecimal, and android receives uppercase hexadecimal, which is uniformly converted to uppercase hexadecimal
    let value = data.value.toString().toUpperCase();
    this.bluetoothReceiveData.push(value);
    console.log("BluetoothUpdateValue", value);
    this.setState({ receiveData: this.bluetoothReceiveData.join("") });
    BluetoothProtocol.parseData(value);
  };


  //////////////////////////////

  stopScan() {
    if (this.state.scaning) {
      console.log("Stop scan clicked");
      BluetoothManager.stopScan();
    }
  }

  scan() {
    if (this.state.scaning) {
      BluetoothManager.stopScan();
      this.setState({ scaning: false });
    }
    if (BluetoothManager.bluetoothState == "on") {
      BluetoothManager.scan()
        .then(() => {
          this.setState({ scaning: true });
        })
        .catch((err) => { });
    } else {
      BluetoothManager.checkState();
      if (Platform.OS == "ios") {
        this.alert("Please turn on your phone's bluetooth");
      } else {
        Alert.alert("Alert", "Please turn on your phone's bluetooth", [
          {
            text: "Cancel",
            onPress: () => { },
          },
          {
            text: "Turn on",
            onPress: () => {
              BluetoothManager.enableBluetooth();
            },
          },
        ]);
      }
    }
  }

  alert(text) {
    Alert.alert("Alert", text, [{ text: "ok", onPress: () => { } }]);
  }


  ///////////////////////////////////



  DATA = [
    "true",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ];

  DAAATTAA = [
    "",
    "",
  ]

  DATA_SERVICES = [
    {
      name: "Service Name",
      uuid: "0x18000",
      characteristics: [
        {
          name: "Device Name",
          uuid: "0x2A00",
        },
        {
          name: "Appearance Name",
          uuid: "0x2A01",
        }
      ]
    },
    {
      name: "Service Name",
      uuid: "0x18000",
      characteristics: [
        {
          name: "Device Name",
          uuid: "0x2A00",
        },
        {
          name: "Appearance Name",
          uuid: "0x2A01",
        }
      ]
    },
  ];

  // Appbar
  renderHeader = () => {
    return <View style={{ flexDirection: "row", paddingStart: 16, paddingBottom: 12, marginTop: 36 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 26, color: 'black', fontWeight: "600" }}>BlueInfo</Text>
        <Text style={{ fontSize: 14, color: 'black' }}>4 Devices</Text>
      </View>
      <View style={{ borderRadius: 12, height: 35, justifyContent: 'center', overflow: 'hidden' }}>
        <TouchableNativeFeedback onPress={this.checkPermissionAndProceed.bind(this)} background={TouchableNativeFeedback.Ripple('#5E6DF9', true)}>
          <View style={{ paddingHorizontal: 12 }}>
            <Text style={{ alignSelf: 'center' }}> {this.state.scaning ? "STOP SCANNING" : "SCAN"}</Text>
          </View>
        </TouchableNativeFeedback>
      </View>
    </View>;
  }

  renderItem = ({ item }) => {
    let isConncted = false;
    return (
      <View style={{ marginHorizontal: 16, marginVertical: 6, borderRadius: 12, backgroundColor: 'white' }}>
        <TouchableNativeFeedback onPress={() => { console.log("Clicked"); }}>
          <View style={{ borderRadius: 12, elevation: isConncted ? 8 : 1, backgroundColor: isConncted ? '#5E6DF9' : 'white', padding: 16, flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: isConncted ? 'white' : 'black', fontSize: 14, fontWeight: "500" }}>"Device Name"</Text>
              <Text style={{ color: isConncted ? 'gainsboro' : 'grey', fontSize: 11 }}>"dnashjfvbjhef "</Text>
            </View>

            {(isConncted)
              ? <View style={{ alignItems: 'flex-end', alignSelf: 'center' }}>
                <FontAwesome name='check' size={24} color={'white'} />
              </View>
              : <View style={{ alignItems: 'flex-end', alignSelf: 'center' }}>
                <View style={{ width: 24, height: 4, backgroundColor: '#E3E3E3', borderRadius: 2 }} />
                <View style={{ height: 2 }} />
                <View style={{ width: 16, height: 4, backgroundColor: 'yellowgreen', borderRadius: 2 }} />
                <View style={{ height: 2 }} />
                <View style={{ width: 8, height: 4, backgroundColor: 'yellowgreen', borderRadius: 2 }} />
              </View>}

          </View>
        </TouchableNativeFeedback>

        {(isConncted)
          ? <View style={{ padding: 14, alignItems: 'flex-end' }}>

            <View style={{ borderRadius: 12, height: 35, justifyContent: 'center', overflow: 'hidden' }}>
              <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('#5E6DF9', true)}>
                <View style={{ paddingHorizontal: 12 }}>
                  <Text style={{ alignSelf: 'center' }}> DISCONNECT </Text>
                </View>
              </TouchableNativeFeedback>
            </View>
            <View style={{ flexDirection: 'row' }}>

              <View style={{ width: 1, marginRight: 10, marginVertical: 4, backgroundColor: "#5E6DF9" }} />

              <FlatList
                style={{ flex: 1 }}
                scrollEnabled={false}
                data={this.DAAATTAA}
                renderItem={({ servicItem }) => {
                  return <View>
                    <Text style={{ fontSize: 14, color: 'black' }}>Service Name</Text>
                    <Text style={{ flexDirection: 'row' }}>
                      <Text style={{ fontSize: 12 }}>UUID: </Text>
                      <Text style={{ fontSize: 12, color: 'black' }}>0x1800A</Text>
                    </Text>


                    <View style={{ flexDirection: 'row', marginVertical: 6 }}>
                      <View style={{ width: 1, marginHorizontal: 8, marginVertical: 4, backgroundColor: "#5E6DF9" }} />

                      <FlatList
                        style={{ flex: 1 }}
                        scrollEnabled={false}
                        data={this.DAAATTAA}
                        renderItem={({ servicItem }) => {
                          return <View style={{ display: 'flex', flexDirection: 'row' }}>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 14, color: 'black' }}>Characteristic Name</Text>
                              <Text>
                                <Text style={{ fontSize: 12 }}>UUID: </Text>
                                <Text style={{ fontSize: 12, color: 'black' }}>0x2A00</Text>
                              </Text>
                              <Text>
                                <Text style={{ fontSize: 12 }}>Propertise: </Text>
                                <Text style={{ fontSize: 12, color: 'black' }}>READ, WRITE, NOTIFY WRITE WITHOUT RESPNOSE</Text>
                              </Text>
                              <Text>
                                <Text style={{ fontSize: 12 }}>Value: </Text>
                                <Text style={{ fontSize: 12, color: 'black' }}>something</Text>
                              </Text>
                              {/* <Text>Descriptors:</Text>
                            <View style={{ flexDirection: 'row', marginVertical: 6 }}>
                              <View style={{ width: 1, marginHorizontal: 8, marginVertical: 4, backgroundColor: "#5E6DF9" }} />

                              <FlatList
                                scrollEnabled={false}
                                data={this.DAAATTAA}
                                renderItem={({ servicItem }) => {
                                  return <View style={{ marginVertical: 2 }}>
                                    <Text>Unknown Descriptor</Text>
                                    <Text>UUID: 0x2A00</Text>
                                  </View>
                                }}
                              />


                            </View> */}
                            </View>

                            <View style={{ flexDirection: 'row' }}>
                              <View style={{ width: 30, height: 30, borderRadius: 18, overflow: 'hidden' }}>
                                <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('#5E6DF9', true)} onPress={() => { console.log("Helo") }}>
                                  <View style={{ padding: 6 }}>
                                    <Feather name="download" size={18} />
                                  </View>
                                </TouchableNativeFeedback>
                              </View>
                              <View style={{ width: 30, height: 30, borderRadius: 18, overflow: 'hidden' }}>
                                <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('#5E6DF9', true)} onPress={() => { console.log("Helo") }}>
                                  <View style={{ padding: 6 }}>
                                    <Feather name="upload" size={18} />
                                  </View>
                                </TouchableNativeFeedback>
                              </View>
                              <View style={{ width: 30, height: 30, borderRadius: 18, overflow: 'hidden' }}>
                                <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('#5E6DF9', true)} onPress={() => { console.log("Helo") }}>
                                  <View style={{ padding: 6 }}>
                                    <Feather name="repeat" size={18} />
                                  </View>
                                </TouchableNativeFeedback>
                              </View>
                            </View>
                          </View>
                        }}
                      />


                    </View>
                  </View>
                }}
              />
            </View>


          </View>
          : <View />}

      </View>
    );
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, }}>
        <View style={{ flex: 1, backgroundColor: "#F6F6F6" }}>

          {/* List */}
          <FlatList
            ListHeaderComponent={this.renderHeader}
            data={this.state.availableDevices}
            renderItem={this.renderItem.bind(this)}
          />

        </View>
      </SafeAreaView>
    );
  }



  putValue = (serviceId, characteristicId, value) => {

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const tempServices = [...this.state.connectedPeripheral.services];

    tempServices.filter(x => x.uuid == serviceId)[0].characteristics.filter(y => y.characteristic == characteristicId)[0]['value'] = value;

    //tempServices[serviceIndex].characteristics[characteristicIndex]['value'] = value;

    const tempConnectedPeripheral = this.state.connectedPeripheral;
    tempConnectedPeripheral.services = tempServices;

    this.setState({
      connectedPeripheral: tempConnectedPeripheral,
    });
  }
}