import React from 'react'
import { SafeAreaView, StyleSheet, View, Button, Text, Image, Alert, TouchableOpacity, Platform, NativeEventEmitter, Modal, TextInput, KeyboardAvoidingView } from 'react-native'
import { launchImageLibrary } from 'react-native-image-picker'
import * as RNFS from 'react-native-fs'
import { FaceCaptureResponse, LivenessResponse, MatchFacesResponse, MatchFacesRequest, MatchFacesImage, ComparedFacesSplit, InitConfig, LivenessSkipStep, LivenessNotification, FaceSDK, LivenessConfig } from '@regulaforensics/face-sdk'
// import { Ionicons } from "@expo/vector-icons"; // Install @expo/vector-icons if needed

interface IProps {
}

interface IState {
  img1: any
  img2: any
  similarity: string
  liveness: string
  modalVisible: boolean
  reportText: string,
  inputText: string
}

// var image1 = new MatchFacesImage()
// var image2 = new MatchFacesImage()

export default class App extends React.Component<IProps, IState> {
  constructor(props: {} | Readonly<{}>) {
    super(props)

    // var eventManager = new NativeEventEmitter(RNFaceApi)
    // eventManager.addListener('livenessNotificationEvent', data => {
    //   var notification = LivenessNotification.fromJson(JSON.parse(data))!
    //   console.log("LivenessStatus: " + notification.status)
    // })

    var onInit = (json: string) => {
      // var response = InitResponse.fromJson(JSON.parse(json))
      // if (!response!.success) {
      //   console.log(response!.error!.code);
      //   console.log(response!.error!.message);
      // } else {
      //   console.log("Init complete")
      // }
    };

    var licPath = Platform.OS === 'ios' ? (RNFS.MainBundlePath + "/license/regula.license") : "regula.license"
    var readFile = Platform.OS === 'ios' ? RNFS.readFile : RNFS.readFileAssets
    readFile(licPath, 'base64').then((license) => {
      // var config = new InitConfig();
      // config.license = license
      // FaceSDK.initialize(config, onInit, (_e: any) => { })
    }).catch(async _ => {
      var [success, error] = await FaceSDK.instance.initialize()
      if (success) console.log("init complete")
      else console.log("init error: " + error?.code + " - " + error?.message)
    })

    this.state = {
      img1: require('./images/portrait.png'),
      img2: require('./images/portrait.png'),
      similarity: "nil",
      liveness: "nil",
      modalVisible: false,
      reportText: '',
      inputText: ''
    }
  }

  pickImage(first: boolean) {
    Alert.alert("Select option", "", [
      {
        text: "Use gallery",
        onPress: () => launchImageLibrary({
          mediaType: 'photo',
          selectionLimit: 1,
          includeBase64: true
        }, (response: any) => {
          if (response.assets == undefined) return
          // this.setImage(first, response.assets[0].base64!, Enum.ImageType.PRINTED)
        })
      },
      // {
      //   text: "Use camera",
      //   onPress: () => FaceSDK.startFaceCapture(null, (json: string) => {
      //     var response = FaceCaptureResponse.fromJson(JSON.parse(json))!
      //     if (response.image != null && response.image.image != null)
      //       this.setImage(first, response.image.image, Enum.ImageType.LIVE)
      //   }, _e => { })
      // }
    ], { cancelable: true })
  }

  setImage(first: boolean, base64: string, type: number) {
    if (base64 == null) return
    this.setState({ similarity: "null" })
    if (first) {
      // image1 = new MatchFacesImage()
      // image1.image = base64
      // image1.imageType = type
      this.setState({ img1: { uri: "data:image/png;base64," + base64 } })
      this.setState({ liveness: "null" })
    } else {
      // image2 = new MatchFacesImage()
      // image2.image = base64
      // image2.imageType = type
      this.setState({ img2: { uri: "data:image/png;base64," + base64 } })
    }
  }

  clearResults() {
    this.setState({ img1: require('./images/portrait.png') })
    this.setState({ img2: require('./images/portrait.png') })
    this.setState({ similarity: "null" })
    this.setState({ liveness: "null" })
    // image1 = new MatchFacesImage()
    // image2 = new MatchFacesImage()
  }

  matchFaces() {
    // if (image1 == null || image1.image == null || image1.image == "" || image2 == null || image2.image == null || image2.image == "")
    //   return
    this.setState({ similarity: "Processing..." })
    // var request = new MatchFacesRequest()
    // request.images = [image1, image2]
    // FaceSDK.matchFaces(request, null, (json: string) => {
    //   var response = MatchFacesResponse.fromJson(JSON.parse(json))
    //   FaceSDK.splitComparedFaces(response!.results!, 0.75, str => {
    //     var split = ComparedFacesSplit.fromJson(JSON.parse(str))!
    //     this.setState({ similarity: split.matchedFaces!.length > 0 ? ((split.matchedFaces![0].similarity! * 100).toFixed(2) + "%") : "error" })
    //   }, e => { this.setState({ similarity: e }) })
    // }, e => { this.setState({ similarity: e }) })
  }

  async liveness() {
    var response = await FaceSDK.instance.startLiveness({
      config: new LivenessConfig({
        skipStep: [LivenessSkipStep.ONBOARDING_STEP]
      })
    })
  }
  toggleModal = () => {
    this.setState({ modalVisible: !this.state.modalVisible });
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>

        <View style={{ padding: 15 }}>
          <TouchableOpacity onPress={() => this.pickImage(true)} style={{ alignItems: "center" }}>
            <Image source={this.state.img1} resizeMode="contain" style={{ height: 150, width: 150 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.pickImage(false)} style={{ alignItems: "center" }}>
            <Image source={this.state.img2} resizeMode="contain" style={{ height: 150, width: 200 }} />
          </TouchableOpacity>
        </View>

        <View style={{ width: "100%", alignItems: "center" }}>
          <View style={{ padding: 3, width: "60%" }}>
            <Button title="Match" color="#4285F4" onPress={() => { this.matchFaces() }} />
          </View>
          <View style={{ padding: 3, width: "60%" }}>
            <Button title="Liveness" color="#4285F4" onPress={() => { this.liveness() }} />
          </View>
          <View style={{ padding: 3, width: "60%" }}>
            <Button title="Clear" color="#4285F4" onPress={() => { this.clearResults() }} />
          </View>
          <View style={{ padding: 3, width: "60%" }}>
            <Button title="Report Issue" color="#FF5733" onPress={() => this.toggleModal()} />
          </View>
        </View>

        <View style={{ flexDirection: 'row', padding: 10 }}>
          <Text>Similarity: {this.state.similarity}</Text>
          <View style={{ padding: 10 }} />
          <Text>Liveness: {this.state.liveness}</Text>
        </View>

        <Button title="Open Keyboard" onPress={this.toggleModal} color="#4285F4" />

        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={this.toggleModal}
        >
          <KeyboardAvoidingView style={styles.modalView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Enter Text</Text>
              <TextInput
                style={styles.input}
                placeholder="Type something..."
                value={this.state.inputText}
                onChangeText={(text) => this.setState({ inputText: text })}
                autoFocus
              />
              <Button title="Close" color="#F44336" onPress={this.toggleModal} />
            </View>
          </KeyboardAvoidingView>
        </Modal>

      </SafeAreaView>
    )
  };
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    marginBottom: 12,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    width: '80%',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
  }
});
