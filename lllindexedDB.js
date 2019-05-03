/*---------------------------数据库操作----------------------------------------------------*/


/*-----------打开或建立一个数据库----------------------------------*/
    /* step0: 判断浏览器是否支持*/
    function caniuseIndexedDB(){
        var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
            if(!indexedDB){
                  console.log("你的浏览器不支持IndexedDB");
             }
             /*在实际生产中用这个*/
            /* if (!window.indexedDB) {
              window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.")
              }   */       
    }



/*var db=buildDB('Test1',2,{
	 onupgrade: function(db){
	 createObjectStore(db,'student',[{idxname: 'ID', unique: true},{idxname: 'name', unique: false}],'ID');
        },
     onsuccess: function(db){
     	
	   remove(db,'student',17);
	   remove(db,'student',10);
	   remove(db,'student',43);
	   readAll(db,'student');
	   
       }
   })*/
/*封装成这样
buildDB('Test1',1, { success: function(){}, onupgrate: function(){}, onerror: function(){}})


*/












/*打开一个数据库 数据库名称，版本，成功后的操作   */
    function buildDB(dbName,version,callbackObj){
    /* step1: 打开一个indexedDB,得到一个操作请求 IDRequest对象*/
    /* indexedDB.open(数据库名字, 数据库版本) => IDRequest，若数据库不存在，就会新建一个数据库，版本为1*/
	  var request=indexedDB.open(dbName, version);
	  console.log(request)
	/*打开数据库失败*/
      request.onerror = function(e) {
            console.log(e.currentTarget.error.message);
            if(callbackObj.onerror){
        	callbackObj.onerror();
        }
            
      };
   /* 打开数据库成功， e.target.result为数据库对象 */
    request.onsuccess = function(e) {
        var db = e.target.result;
        console.log('成功打开DB');
        console.log(db)
        if(callbackObj.onsuccess){
        	callbackObj.onsuccess(db);
        }
        
       // return db; //无法返回
        
    };


 //若要求打开的数据库版本大于现有的版本，升级

    request.onupgradeneeded = function(e) {
        var db = e.target.result; //数据库对象
        console.log('升级db,执行callback')
        if(callbackObj.onupgrade){
        	callbackObj.onupgrade(db);
        }
       
     };
}
	
/*----------------------数据操作: 添加一条记录，删除，更新，读取，以及读取全部数据-------------------*/
/*----------------------数据操作: 添加一条记录，删除，更新，读取，以及读取全部数据-------------------*/
/*添加数据
  参数：数据库对象，数据仓库名，待添加的数据

*/

function add(db,storeName,dataObj) {
   /*上面代码中，写入数据需要新建一个事务。新建时必须指定表格名称和操作模式（“只读”或“读写”）。新建事务以后，通过IDBTransaction.objectStore(name)方法，拿到 IDBObjectStore 对象，再通过表格对象的add()方法，向表格写入一条记录。*/

   //新建一个事务，新建时必须指定表格名称和操作模式（“只读”或“读写”）
   var transaction = db.transaction([storeName], 'readwrite');
   //通过IDBTransaction.objectStore(name)方法，拿到 IDBObjectStore 对象
   var store = transaction.objectStore(storeName);

   //再通过表格对象的add()方法，向表格写入一条记录
    //var request = store.add({ id: 1, name: '张三', age: 24, email: 'zhangsan@example.com' });
  var request = store.add(dataObj);
//以上简写为，链式调用
  /*var request = db.transaction(['person'], 'readwrite')
    .objectStore('person')
    .add({ id: 1, name: '张三', age: 24, email: 'zhangsan@example.com' });*/

//写入操作是一个异步操作，通过监听连接对象的success事件和error事件，了解是否写入成功。
  request.onsuccess = function (event) {
    console.log('数据写入成功');
  };

  request.onerror = function (event) {
    console.log('数据写入失败');
  }
}
/*添加数据
  参数：数据库对象，数据仓库名，主键值, 回调函数
*/

function read(db,storeName,keyPath,callback) {
	/*transaction(['person'])第一个参数是一个数组，里面是所涉及的对象仓库，通常是只有一个；
	第二个参数是一个表示操作类型的字符串。目前，操作类型只有两种：readonly（只读）和readwrite（读写）。添加数据使用readwrite，读取数据使用readonly。第二个参数是可选的，省略时默认为readonly模式*/
   var transaction = db.transaction([storeName]);
     
   var objectStore = transaction.objectStore(storeName);
   //根据主键来读取数据
   var request = objectStore.get(keyPath);

   request.onerror = function(event) {
     console.log('事务失败');
   };

   request.onsuccess = function( event) {
   	 
   	  console.log('read...')
          	     console.log(request.result)
   	  if(request.result){
          if(callback){         	   
       	         callback(request.result);
           }
           /* console.log('Name: ' + request.result.name);
        console.log('Age: ' + request.result.age);
        console.log('Email: ' + request.result.email);*/

   	  }else {
        console.log('未获得数据记录');
        return;
      }
   };
}

// 遍历数据， 使用指针对象 IDBCursor ，建立指针对象objectStore.openCursor()
function readAll(db,storeName,callback) {
  var objectStore = db.transaction(storeName).objectStore(storeName);

   objectStore.openCursor().onsuccess = function (event) {
     var cursor = event.target.result;
         if(callback){
            	callback(cursor);
          }
      
     /*if (cursor) {
     	console.log('key: ' + cursor.key)
     	for(var key in cursor.value){
     		console.log(key,cursor.value[key])
     	}
       console.log('Id: ' + cursor.key);
       console.log('Name: ' + cursor.value.name);
       console.log('Age: ' + cursor.value.age);
       console.log('Email: ' + cursor.value.email);
       cursor.continue(); //指针往下
    } else {
      console.log('没有更多数据了！');
    }*/
  };
}
//更新数据
function update(db,storeName,newData) {

  var request = db.transaction(storeName, 'readwrite')
    .objectStore(storeName).put(newData);
    //.put({ id: 1, name: '李四', age: 35, email: 'lisi@example.com' });

  request.onsuccess = function (event) {
    console.log('数据更新成功');
  };

  request.onerror = function (event) {
    console.log('数据更新失败');
  }
}
/*----------------------数据操作: 添加一条记录，删除，更新，读取，以及读取全部数据-------------------*/
/*----------------------数据操作: 添加一条记录，删除，更新，读取，以及读取全部数据-------------------*/


/*-----------------------删除操作----------------------------------------------------------------------------*/
/*-----------------------删除操作----------------------------------------------------------------------------*/
//----------删除数据-------------------------------------------------
function remove(db,storeName,keyPath,callback) {
  var request = db.transaction([storeName], 'readwrite')
    .objectStore(storeName)
    .delete(keyPath);

  request.onsuccess = function (event) {
    console.log('数据删除成功');
    if(callback){
      callback(db,storeName);
    }
  };
   request.onerror = function (event) {
    console.log('数据删除失败');
  }
}
//----------删除数据仓库表-------------------------------------------------
/*删除数据仓库表 db.createObjectStore只能在IDBDatabase.onversionchange中使用，
 数据库版本变化时触发（发生upgradeneeded事件，或调用indexedDB.deleteDatabase()）*/
function deleteObjectStore(dbName, dbVersion, oldStoreName,newStoreName){

var request = indexedDB.open(dbName, dbVersion);


  var db = request.result;
  db.deleteObjectStore(oldStoreName);
  console.log('删除数据仓库表成功')
  
 
  /*if (e.oldVersion < 1) {
    db.createObjectStore('store1');
  }

  if (e.oldVersion < 2) {
    db.deleteObjectStore('store1');
    db.createObjectStore('store2');
  }*/



}


//----------删除数据库-------------------------------------------------

//删除数据库 调用 indexedDB.deleteDatabase(name),返回 IDBRequest对象
//删除不存在的数据库并不会报错
function deleteDB(name) {

    var DBDeleteRequest = window.indexedDB.deleteDatabase(name);
    DBDeleteRequest.onerror = function (event) {
             console.log('deleteDB Error');
     };

    DBDeleteRequest.onsuccess = function (event) {
              console.log('deleteDB success');
    };

}
/*-----------------------删除操作----------------------------------------------------------------------------*/
/*-----------------------删除操作----------------------------------------------------------------------------*/


/*新建一个数据仓库表*/
 // request.onupgradeneeded 和 indexedDB.deleteDatabase 会触发 IDBdataBase 的onversionchange事件
 // 在onversionchange事件里可以使用 db.createObjectStore和 db.deleteObjectStore来创建和删除数据表

 /*说明: 在当前的数据库db中新建一个名为storeName的数据仓库表,表的主键为keyPath(默认是一个递增的整数)，
         表的索引对象indexObj
   参数：数据库对象 新建数据仓库表名称  索引数组indexArr=[{index: 'name', unique: true},{index: 'name', unique: false}]  主键
   返回：一个IDBObjectStore对象

 */
function createObjectStore(db,storeName,indexArr,keyPath){
	//先判断在目前的数据库当中表格（objectStore）是否存在,用表格的名字判断
    //否则,创建一个新的表格(即对象仓库 IDBObjectStore)

       // db.objectStoreNames 返回一个 DOMStringList 对象（字符串的集合），包含当前数据的所有 object store 的名字
       //如果该对象仓库已经存在，就会抛出一个错误。为了避免出错，需要用到下文的objectStoreNames属性，检查已有哪些对象仓库
        if (!db.objectStoreNames.contains(storeName)) {
            console.log("我需要创建一个新的存储对象");
          //新建一张叫做person的表格，主键是id
          //db.createObjectStore(name,{})只能在onversionchange事件里面调用
          if(keyPath){
          
          	var objectStore = db.createObjectStore(storeName, {
                keyPath: keyPath,
                 //指定主键为一个递增的整数
                /*keyPath属性表示主键（由于主键的值不能重复，所以上例存入之前，必须保证数据的email属性值都是不一样的），默认值为null；autoIncrement属性表示，是否使用自动递增的整数作为主键（第一个数据记录为1，第二个数据记录为2，以此类推），默认为false。一般来说，keyPath和autoIncrement属性只要使用一个就够了，如果两个同时使用，表示主键为递增的整数，且对象不得缺少keyPath指定的属性。*/
            });
          }else{
            var objectStore = db.createObjectStore(storeName, {               
                autoIncrement: true 
            });

          }
          
            
             
             /*step3: 新建索引  IDBIndex 对象*/

            //索引名称、索引所在的属性、配置对象（说明该属性是否包含重复的值）指定可以被索引的字段，unique字段是否唯一

            indexArr.forEach(function(ele){

                   
            	    console.log(ele)
                       objectStore.createIndex(ele.idxname, ele.idxname, {
                        unique: ele.unique
                      });
            })
            	
            

          /*  objectStore.createIndex("name", "name", {
                unique: false
            });

            objectStore.createIndex("phone", "phone", {
                unique: false
            });*/

        }
        return objectStore;
        //console.log('数据库版本更改为： ' + version);
}
