/*
* 文件名: Home.js
* 作者: liushun
* 描述: 微信聊天页
* 修改人:
* 修改时间:
* 修改内容:
* */

import React from 'react';
import MainView from '../Components/MainView'
import {Header, ListItem, Button, Badge, Avatar} from "react-native-elements";
import {Text, TouchableOpacity, View, TouchableWithoutFeedback, FlatList} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import DropMenu from '../Components/DropMenu'
import ApiUtil from '../Service/ApiUtil'
import {getFriendList} from "../Service/action";
import {connect} from "react-redux";
import { DeleteTalkList} from "../Redux/actionCreators";
import Toast from "react-native-root-toast";
import config from '../Config'
import {sort} from '../Util/Tool'


class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      show: false,
    }
  }

  componentWillMount(): void {
    const user = this.props.user;
    const loginObj = this.props.loginObj;
    if(loginObj.login){
      global.io.emit('login', user, (mes)=>{
        Toast.show(mes,{
          duration: Toast.durations.SHORT,
          position: Toast.positions.TOP
        })
      })
    }else{
      this.props.navigation.navigate('LoginView');
    }
  }

  componentDidMount(): void {
    const user = this.props.user;
    console.tron.log(user)
    this.props.getFriendList(user.id);
  }

  componentWillUnmount(): void {

  }

  goChat=(item)=>{
    if(this.state.show){
      this.setState({
        show: false,
      })
      return;
    }
    this.props.navigation.navigate('ChatView', {'friendName':item.username, 'friendId':item._id});
  }

  goAction= async (item) => {

    const roomId = sort(this.props.user.id, item._id)

    const result = await ApiUtil.request('deleteMessageHistory', roomId, true)

    if(result.data.errno === 0){
      this.props.deleteTalk(item);
    }else{

    }

  }

  addFriend=()=>{
    this.setState({
      show: false,
    })
    this.props.navigation.navigate('AddFriend');
  }

  keyExtractor = (item, index) => item._id.toString()

  renderItem = ({ item }) => {
    return(
      <TouchableOpacity
        onPress={()=>this.goChat(item)}
        onLongPress={()=>this.goAction(item)}
      >
        <ListItem
          title={item.username}
          subtitle={item.lastMsg && item.lastMsg.text}
          leftElement={
            <View>
              <Avatar
                round={false}
                source={{
                  uri: config.baseURL +'/'+ item.avatar
                }}
              />
              {item.unReadMsg > 0?
                <Badge value={item.unReadMsg} status="error" containerStyle={{ position: 'absolute', top: -15, right: -15}}></Badge>
                :
                null
              }
            </View>
          }
          bottomDivider
        />
      </TouchableOpacity>
    )
  }


  render() {
    return (
      <MainView>

        {/*头部*/}

        <TouchableWithoutFeedback
          onPress={()=>{
            if(this.state.show){
              this.setState({
                show: false
              })
            }
          }}
        >
          <Header
            placement="left"
            leftComponent={
              <Text>微信(202)</Text>
            }
            rightComponent={
              <View style={{flexDirection: 'row'}}>
                <Ionicons name={'ios-search'} size={20} color={'black'}/>
                <View style={{width: 10}}>
                </View>
                <TouchableOpacity onPress={()=>{
                  this.setState({
                    show: !this.state.show
                  })
                }}>
                  <Ionicons name={'ios-add-circle-outline'} size={20} color={'black'}/>
                </TouchableOpacity>
              </View>
            }
            containerStyle={{
              backgroundColor: 'white',
              justifyContent: 'space-around',
              paddingRight: 30,
              height: 60,
              paddingTop: 0,
            }}
          />
        </TouchableWithoutFeedback>


        {/*最近聊天列表*/}


        <FlatList
          keyExtractor={this.keyExtractor}
          data={this.props.talkList}
          renderItem={this.renderItem}
          onScroll={()=>{
            if(this.state.show){
              this.setState({
                show: false,
              })
            }
          }}
          >

        </FlatList>

        {/*弹窗*/}

        {this.state.show?
          <DropMenu
            style={{position:'absolute', right:10, top: 60}}
            navigation={this.props.navigation}
            addFriend={this.addFriend}
          >

          </DropMenu>:null}
      </MainView>
    );
  }
}

const mapState = state => ({
  user: state.UserReducer.get('user').toJS(),
  loginObj: state.UserReducer.get('loginObj').toJS(),
  talkList: state.UserReducer.get('talkList').toJS()
})

const mapDispatch = dispatch => ({
  getFriendList(param) {
    dispatch(getFriendList(param))
  },
  deleteTalk(obj){
    dispatch(DeleteTalkList(obj))
  }
})

export default connect(
  mapState,
  mapDispatch
)(Home)

