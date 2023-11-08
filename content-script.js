function main() {

    const copy_btn = document.createElement('button');
    copy_btn.id = 'copy_btn';
    copy_btn.innerHTML = "JSON";
    copy_btn.onclick = () => conv_and_copy("JSON");
    copy_btn.style.position = "fixed";
    copy_btn.style.top = "0";
    copy_btn.style.zIndex = 10001;
    copy_btn.style.cursor = 'pointer';
    document.querySelector("div").before(copy_btn);
    
    const tsv_btn = document.createElement('button');
    tsv_btn.innerHTML = "TSV";
    tsv_btn.onclick = () => conv_and_copy("TSV");
    tsv_btn.style.position = "fixed";
    tsv_btn.style.top = "2.4rem";
    tsv_btn.style.zIndex = 10001;
    tsv_btn.style.cursor = 'pointer';
    document.querySelector("div").before(tsv_btn);

    const text_btn = document.createElement('button');
    text_btn.innerHTML = "Text";
    text_btn.onclick = () => conv_and_copy("Text");
    text_btn.style.position = "fixed";
    text_btn.style.top = "4.8rem";
    text_btn.style.zIndex = 10001;
    text_btn.style.cursor = 'pointer';
    document.querySelector("div").before(text_btn);

    const disp_num = document.createElement('span');
    disp_num.id = 'num_of_items';
    disp_num.style.position = "fixed";
    disp_num.style.top = "7.2rem";
    disp_num.style.padding = "0 0.5rem";
    disp_num.style.zIndex = 10001;
    disp_num.style.color = "gray";
    disp_num.style.fontWeight = "bold";
    disp_num.style.fontSize = "small";
    disp_num.style.cursor = 'pointer';
    document.querySelector("div").before(disp_num);
    disp_num.onclick = () => show_viewwindow();
};

main();

let posts_store = {};
let str_to_clipboard = '';

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
        () => document.getElementById('num_of_items').innerHTML +=
            "<br>クリップボードに<br>コピーしました",
        () => alert("クリップボードにコピーできませんでした")
    );
    str_to_clipboard = copy_str;
}

document.onscroll = function() {
    console.log("RTS to JSON working...");

    const posts = Array.from(
        document.querySelectorAll("div.Tweet_Tweet__bq4XS")
    ).forEach(

        e => {
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
        }
    );
    
    // 保存された件数の表示
    document.getElementById('num_of_items').innerHTML = Object.keys(posts_store).length;
};


function show_viewwindow() {
    w = window.open("", "ClipboardView","width=600,height=600");
    w.document.open();
    w.document.write(`<html><head><style>
* { padding: 0; margin: 0; font-family: Consolas, Monospace; line-height:2em; }
textarea { width: 100%; height: 100%; padding: 1em; border: none; }
textarea:focus { outline: none; }
</style></head>
<body><textarea>` + str_to_clipboard + "</textarea></body></html>");
    w.document.close();
}
