import React from 'react'
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  Button,
  TouchableOpacity,
} from 'react-native'
import { Constants, SecureStore, SQLite } from 'expo'

const db = SQLite.openDatabase('todo.db')

interface IState {
  todoText: string
  items: string[]
}

export default class App extends React.Component<{}> {
  state = {
    todoText: '',
    items: [],
  }

  _listItemrenderer = (item: string) => {
    return (
      <TouchableOpacity onPress={() => this._delete(item)}>
        <View style={styles.listItem}>
          <Text style={styles.itemText}>{item}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  // async componentDidMount() {
  //   console.log('mounted')
  //   try {
  //     const list = await SecureStore.getItemAsync('list')
  //     if (list !== null && list !== undefined) {
  //       this.setState({ items: JSON.parse(list) })
  //     }
  //     console.log(list)
  //   } catch (error) {
  //     // Error handling
  //   }
  // }

  async componentDidMount() {
    try {
      this._update()
      db.transaction((tx: any) => {
        tx.executeSql('create table if not exists items (todoText text);')
      }, this._update)
    } catch (error) {
      // Error handling
    }
  }

  _insert = async () => {
    // try {
    //   await this.setState({
    //     todoText: '',
    //     items: [...this.state.items, this.state.todoText],
    //   })
    //   await SecureStore.setItemAsync('list', JSON.stringify(this.state.items))
    // } catch (error) {
    //   // Error handling
    // }
    const { items, todoText } = this.state
    try {
      await this.setState({
        todoText: '',
        items: [...this.state.items, this.state.todoText],
      })
      await db.transaction((tx: any) => {
        tx.executeSql('insert into items (value) values (?)', [todoText])
      }, this._update)
    } catch (error) {
      // Error handling
    }
  }

  _delete = async (todoText: string) => {
    // const index = (this.state.items as string[]).indexOf(todoText)
    // this.state.items.splice(index, 1)
    // try {
    //   await this.setState({ items: [...this.state.items] })
    //   await SecureStore.setItemAsync('list', JSON.stringify(this.state.items))
    // } catch (error) {
    //   // Error handling
    // }
    const index = (this.state.items as string[]).indexOf(todoText)
    this.state.items.splice(index, 1)
    try {
      await this.setState({ items: [...this.state.items] })
      await db.transaction(
        (tx: any) => {
          tx.executeSql(`delete from items where todoText = ?;`, [todoText])
        },
        null,
        this._update
      )
    } catch (error) {
      // Error handling
    }
  }

  render() {
    const { items } = this.state
    if (items === null || items.length === 0) {
      return null
    }
    return (
      <SafeAreaView style={styles.container}>
        <TextInput
          style={styles.todoText}
          value={this.state.todoText}
          onChangeText={todoText => this.setState({ todoText })}
        />
        <FlatList
          data={this.state.items}
          style={styles.list}
          renderItem={({ item }) => this._listItemrenderer(item)}
          keyExtractor={(item, index) => index.toString()}
        />
        <Button title={'Add Todo'} onPress={this._insert} />
      </SafeAreaView>
    )
  }

  _update() {
    db.transaction((tx: any) => {
      tx.executeSql(`select * from items`, [], ({ rows: { _array } }) =>
        this.setState({ items: _array })
      )
    })
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todoText: {
    width: '90%',
    marginTop: 16,
    marginBottom: 16,
    borderBottomWidth: 2,
    fontSize: 18,
    justifyContent: 'center',
  },
  list: {
    width: '100%',
    flex: 1,
  },
  listItem: {
    backgroundColor: '#4286f4',
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 18,
    color: 'white',
  },
})
