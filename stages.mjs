/** Fixed 16-sector wall gaps. All walls are solid except the numbered openings. */
export const stages = [
  {id:'001', title:'FIRST SPIN', walls:[[3,11]], expected:1, answer:[-1], tip:'まずは、↺か↻を押してみよう。', insight:'リングの切れ目へ赤玉が運ばれる。'},
  {id:'002', title:'LOOK AHEAD', walls:[[3,11],[3]], expected:1, answer:[-1], tip:'外側の穴も見てみよう。', insight:'穴が並んでいれば何枚でも一気に抜ける。'},
  {id:'003', title:'MIRROR', walls:[[3,11],[11]], expected:1, answer:[1], tip:'今度は反対側がつながっている。', insight:'見た目を読んで、左右を切り替える。'},
  {id:'004', title:'THE LONG WAY', walls:[[6,14],[14]], expected:1, answer:[1], tip:'一番近い穴が正解とは限らない。', insight:'遠回りすると2枚のリングを一度で突破。'},
  {id:'005', title:'TWO TURNS', walls:[[3,11],[3,14],[1,10],[1]], expected:2, answer:[-1,-1], tip:'2回の方向選択で外まで。', insight:'↺で2枚抜き、もう一度↺で2枚抜き。'},
  {id:'006', title:'REVERSE', walls:[[3,11],[11,2],[7,14],[7]], expected:2, answer:[1,-1], tip:'途中で逆回転してみよう。', insight:'↻で2枚抜き、↺で残りの2枚。'},
  {id:'007', title:'TUNNEL', walls:[[3,11],[3],[3],[6,12],[6]], expected:2, answer:[-1,1], tip:'穴の縦並びを探そう。', insight:'3連続の「ポポポン！」が起きる。'},
  {id:'008', title:'TRIPLE TUNNEL', walls:[[3,11],[11],[11],[6,0],[6],[6]], expected:2, answer:[1,-1], tip:'6枚あっても、答えは2手。', insight:'3枚抜きのあと、さらに3枚抜き。'},
  {id:'009', title:'BAIT', walls:[[3,11],[3,0],[3,0],[0,1,8],[0],[0],[0]], expected:2, answer:[1,1], tip:'目立つ長い穴列が、罠かもしれない。', insight:'少ししか進まない道が、最後の大貫通につながる。'},
  {id:'010', title:'↺ OR ↻', walls:[[3,11],[3,14],[7,0],[7],[7],[3,11],[3],[3]], expected:3, answer:[-1,1,-1], tip:'8枚を3回の操作で抜けよう。', insight:'2枚 → 3枚 → 3枚。穴の配置だけで解く総合問題。'},
];
