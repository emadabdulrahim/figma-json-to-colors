const str = JSON.stringify(
  "const tomato = { tomato1: '#fffcfc', tomato2: '#fff8f7', tomato3: '#fff0ee', tomato4: '#ffe6e2', tomato5: '#fdd8d3', tomato6: '#fac7be', tomato7: '#f3b0a2', tomato8: '#ea9280', tomato9: '#e54d2e', tomato10: '#db4324', tomato11: '#ca3214', tomato12: '#341711',}"
)
const str1 = JSON.stringify('{"h":"w"}')
console.log("🚀 ~ file: tmp.js ~ line 5 ~ str1", str1)

const obj = JSON.parse(JSON.parse(str1))
console.log("🚀 ~ file: tmp.js ~ line 6 ~ obj", typeof obj)
