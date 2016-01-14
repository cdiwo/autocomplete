# autocomplete

##使用方法

#####引入 autocomplete 文件

全局方式，在HTML页面中引入:
```html
<script src="jquery.autocomplete.js"></script>
```

###HTML代码
```html
<input id="Search_Input" type="text">
```

###Javascript代码
```js
$('#element').autocomplete(params);
```

Example：
* 使用默认固定源数据搜索
```js
$('#Search_Input').autocomplete({
    source: ['a', 'b', 'ab', 'ac', 'ad'],
    // obj: 选中项jquery对象
    select: function(obj) {
        alert("selected html: " + obj.html());
    }
});
```
* 使用远程源数据+自定义模板搜索
```js
$('#Search_Input').autocomplete({
    // arttemplate 模板
    template: 
        '{{each data as v}}' +
        '<li class="ui-menu-item" data-id="{{v.goods_id}}>{{v.name}}</li>' +
        '{{/each}}',
    // value: 输入值， 
    // response：回调，将json值输出，
    // json格式[默认template需包含data属性]：{code: 0, data: [{"goods_id": 1, "name": "test name"}]}
    source: function(value, response) {
        $.getJSON("/goods/search-goods", {keywords: value}, function(json) {
            if(json.code == 0 && json.data.length > 0) {
                response(json);
            }
        })
    },
    // obj: 选中项jquery对象
    select: function(obj) {
        alert("selected html: " + obj.html());
    }
});
```

###服务器端
数据返回格式必须为json格式，数据结构如下：</br>
code: 0：表示正常，> 0的值表示有错误</br>
message: 提示信息</br>
data: 返回数据
```
{code: 0, data: [{"goods_id": 1, "name": "test name"}]}
```
##参数
### 
<table>
<thead>
<tr>
  <th>参数</th>
  <th>类型</th>
  <th>默认值</th>
  <th>说明</th>
</tr>
</thead>
<tbody>
<tr><th colspan="4">构造参数</th></tr>
<tr>
    <td>params</td>
    <td>object</td>
    <td>{}</td>
    <td>可选参数</td>
</tr>
<tr>
  <th colspan="4">params参数</th>
</tr>
<tr>
    <td>appendTo</td>
    <td>jquery元素</td>
    <td>null</td>
    <td>把结果项列表添加到某个元素里面</td>
</tr>
<tr>
    <td>minLength</td>
    <td>int</td>
    <td>1</td>
    <td>触发搜索的value最小长度</td>
</tr>
<tr>
    <td>delay</td>
    <td>int</td>
    <td>300</td>
    <td>触发延迟，单位:毫秒</td>
</tr>
<tr>
    <td>autoFocus</td>
    <td>boolean</td>
    <td>true</td>
    <td>自动选中第1条搜索结果</td>
</tr>
<tr>
    <td>auto</td>
    <td>boolean</td>
    <td>true</td>
    <td>自动搜索，输入关键字后自动触发搜索事件</td>
</tr>
<tr>
    <td>cache</td>
    <td>boolean</td>
    <td>true</td>
    <td>开启缓存后，相同的关键字将使用缓存结果；如果查询的关键字数据更新很快，可以关闭缓存</td>
</tr>
<tr>
    <td>itemClass</td>
    <td>string</td>
    <td>li.ui-menu-item</td>
    <td>结果项class</td>
</tr>
<tr>
    <td>position</td>
    <td>object</td>
    <td>
    {
        my: "left top",
        at: "left bottom",
        collision: "none"
    }
    </td>
    <td>并行上传量，在进行多文件同时上传时的并发量</td>
</tr>
<tr>
    <td>template</td>
    <td>string</td>
    <td></td>
    <td>arttemplate模板字符串</td>
</tr>
<tr>
  <th colspan="4">数据来源（Source)</th>
</tr>
<tr>
    <td>source</td>
    <td>array/function</td>
    <td>[]</td>
    <td>
    * array: 固定搜索源<br/>
    * function(value, response): 根据value关键字，远程搜索数据，使用response回调结果
    </td>
</tr>
<tr>
  <th colspan="4">回调函数（Callback)</th>
</tr>

<tr>
    <td>onSelect</td>
    <td>function(obj){}</td>
    <td></td>
    <td>结果项选中后</td>
</tr>
<tr>
    <td>onClose</td>
    <td>function(){}</td>
    <td></td>
    <td>列表项关闭后</td>
</tr>
<tr>
    <td>onError</td>
    <td>function(){}</td>
    <td></td>
    <td>搜索失败后</td>
</tr>

</tbody>
</table>
