<!DOCTYPE HTML>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8"></meta>
    <title>UI测试-API列表</title>
</head>
<body>
    <div class="header">
        <h2>UI测试-API列表</h2>
    </div>
    <div class="content">
        <div class="catalog">
            {{#docs}}
            <ul>
                <li>
                    <h3>{{name}}</h3>
                    <pre>{{desc}}</pre>
                    <ul>
                        {{#items}}
                        <li>
                            <a href="#item-{{name}}">{{name}}</a>
                        </li>
                        {{/items}}
                    </ul>
                </li>
            </ul>
            {{/docs}}
        </div>
        <hr />
        <div class="documents">
            {{#docs}}
            <ul>
                <li>
                    <h3>{{name}}</h3>
                    <ul>
                        {{#items}}
                        <li id="item-{{name}}">
                            <h4>{{name}}</h4>
                            <div class="description">
                            <pre>{{description}}</pre>
                            </div>
                        </li>
                        {{/items}}
                    </ul>
                </li>
            </ul>
            {{/docs}}
        </div>
    </div>
</body>
</html>