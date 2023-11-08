const posts_store = {};
async function collect_posts() {

    const posts = Array.from(
        document.querySelectorAll("div.Tweet_Tweet__bq4XS")
    ).forEach(e => {
        const name = e.querySelector("div.Tweet_info__5pNCA > p > span").textContent;
        const scname = e.querySelector("div.Tweet_info__5pNCA > p > a").textContent;
        let reply_id = '';
        if (e.querySelector("span.Tweet__reply")) {
            reply_id = e.querySelector("span.Tweet__reply > a").textContent;
            e.querySelector("span.Tweet__reply").remove();
        }
        const post = e.querySelector(".Tweet_body__XtDoj").textContent;
        
        const res = e.querySelector("a.Tweet_icon__ADmHM").getAttribute("data-cl-params").match(/twid:([0-9]+)\D/);
        const tid = res[1];

        if (tid in posts_store == false)
            posts_store[tid] = {
                'tid': tid,
                'name': name,
                'screenname': scname,
                'text': post,
                'reply_id': reply_id
            };
    });
    
    // 保存された件数の表示
    document.getElementById('num_of_items').textContent = Object.keys(posts_store).length;
};


function set_control_panel() {

    function show_viewwindow() {
        w = window.open("", "ClipboardView","width=600,height=600");
        w.document.open();
        w.document.write(`<html><head><style>
* { padding: 0; margin: 0; font-family: Consolas, Monospace; line-height:2em; }
textarea { width: 100%; height: 100%; padding: 1em; border: none; }
textarea:focus { outline: none; }
</style></head>
<body><textarea>${str_to_clipboard}</textarea></body></html>`);
        w.document.close();
    }

    function conv_and_copy(fmt) {
        let jo = Object.values(posts_store);
        jo.sort((a,b) => a.tid - b.tid);
        let copy_str = '';
        if (fmt == 'JSON') {
            copy_str = JSON.stringify(jo, null);
        } else if (fmt == 'TSV') {
            copy_str = jo.map(x => {
                const oneline = x.text.replace(/\n/g, ' ');
                return [x.tid, x.screenname, x.name,
                        x.text, x.reply_id].join("\t");
            }).join("\n");
        } else if (fmt == 'Text') {
            copy_str = jo.map(x => {
                const oneline = x.text.replace(/\n/g, ' ');
                return oneline;
            }).join("\n");
        }
        navigator.clipboard.writeText(copy_str).then(
            () => document.getElementById('message_area').innerHTML =
                "クリップボードに<br>コピーしました",
            () => alert("クリップボードにコピーできませんでした")
        );
        str_to_clipboard = copy_str;
    }

    let str_to_clipboard = '';

    const conpane = document.createElement('div');
    conpane.id = 'conpane';
    conpane.style.position = "fixed";
    conpane.style.top = "0";
    conpane.style.zIndex = 10001;
    conpane.style.cursor = 'pointer';
    document.querySelector("div").before(conpane);

    const copy_btn = document.createElement('button');
    copy_btn.textContent = "JSON";
    copy_btn.style.display = "block";
    copy_btn.onclick = () => conv_and_copy("JSON");
    conpane.appendChild(copy_btn);

    const tsv_btn = document.createElement('button');
    tsv_btn.textContent = "TSV";
    tsv_btn.style.display = "block";
    tsv_btn.onclick = () => conv_and_copy("TSV");
    conpane.appendChild(tsv_btn);

    const text_btn = document.createElement('button');
    text_btn.textContent = "Text";
    text_btn.style.display = "block";
    text_btn.onclick = () => conv_and_copy("Text");
    conpane.appendChild(text_btn);

    const disp_area = document.createElement('div');
    disp_area.style.padding = "0.5rem";
    disp_area.style.color = "gray";
    disp_area.style.fontWeight = "bold";
    disp_area.style.fontSize = "small";
    disp_area.style.cursor = 'pointer';
    disp_area.onclick = () => show_viewwindow();
    conpane.appendChild(disp_area);

    const disp_num = document.createElement('div');
    disp_num.id = 'num_of_items';
    disp_area.appendChild(disp_num);

    const disp_msg = document.createElement('div');
    disp_msg.id = 'message_area';
    disp_msg.style.fontSize = "x-small";
    disp_area.appendChild(disp_msg);
};


async function main() {
    set_control_panel();

    // callback function for observer
    const config = { childList: true, subtree: true };
    const generate_callback = (e, f) => async function (mutations, observer) {
        observer.disconnect(); // stop observation
        //console.log('stop observation and do something');
        try {
            await f();
        } catch (error) {
            console.error('Error:', error);
        }
        //console.log('restart observation');
        observer.observe(e, config); // restart observation
    };

    await collect_posts();

    const e = document.querySelector('#contentsBody');
    console.assert(e);
    const callback = generate_callback(e, collect_posts);
    const observer = new MutationObserver(callback);
    observer.observe(e, config);
}

main();

