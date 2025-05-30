// 从 react-native 框架里面 import 需要用到的组件
import { View, Text, StyleSheet, TextInput, Button } from 'react-native'
import { useState } from 'react'

function app() {

  // username 和 password 就是保存输入框里的内容的变量
  // onChangeText 和 onChangeNumber 是设置这些变量的函数（官方术语叫“setter”），表示当用户输入用户名/密码时，更新 username 和 password 的函数
  // useState('') 表示定义了一个状态变量，初始值是空字符串 ''
  const [username, onChangeText] = useState('');
  const [password, onChangeNumber] = useState('');

  return (
    // https://reactnative.dev/docs/view
    // 这是一个容器视图，使用了外部定义好的样式 styles.container。React Native 中 View 相当于 div。
    <View style={styles.container}>
      {/*https://reactnative.dev/docs/text*/}
      {/*欢迎文本*/}
      <Text>Welcome!</Text>

      {/*https://reactnative.dev/docs/textinput*/}
      {/*用户名输入框*/}
      {/*value={username}：它的当前值是 username 这个变量的值*/}
      {/*onChangeText={onChangeText}：当你在这个框里输入内容时，会调用 onChangeText，也就是上面定义的 setUsername（函数别名），来更新 username。*/}
      {/*placeholder="username"：提示文字是 "username"*/}
      <TextInput
        style={styles.input}
        onChangeText={onChangeText}
        value={username}
        placeholder="username"
      />

      {/*https://reactnative.dev/docs/textinput*/}
      {/*跟上面一样绑定了 value 和 onChangeText（这里叫 onChangeNumber，只是换了个名字）*/}
      {/*keyboardType="numeric"：这个表示用户在输入的时候，手机上会弹出数字键盘，可能用于只允许数字密码。*/}
      <TextInput
        style={styles.input}
        onChangeText={onChangeNumber}
        value={password}
        placeholder="password"
        keyboardType="numeric"
      />
      {/*https://reactnative.dev/docs/button*/}
      {/*创建一个按钮，title 是按钮标题，onPress 是点击事件，控制按钮的行为，还没有做*/}
      {/*accessibilityLabel 的意思是用户执行无障碍操作时的提示*/}
      <Button
        // onPress={onPressLearnMore}
        title="Login"
        // color="#233333"
        accessibilityLabel="Click to login"
      />
    </View>
  );
}

// 相当于 css, 配合 style=
// 用于控制网页显示的样式
const styles = StyleSheet.create({
  // 自定义变量，网页容器
  container: {
    flex: 1, // flex 布局
    backgroundColor: '#F5FCFF',
    alignItems: 'center', // flex 布局-元素局中
    justifyContent: 'center', // flex 布局-元素局中
  },
  // 自定义变量，输入框
  input: {
    height: 40, // 输入框高度
    margin: 8, // 外部边距
    borderWidth: 1, // 边框宽度
    padding: 10, // 内部边距
  },
})

export default app;