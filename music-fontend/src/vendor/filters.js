// 根据id显示来源
const typeFilter = (t) => {
  switch(t) {
    case 'qq':
      return 'QQ音乐';
    case 'netease':
      return '网易云音乐';
    case 'xiami':
      return '虾米音乐';
  }
};

// 如果歌手名称有多个,用'/'分开
const artistFilter = (artists) => {
  return artists && artists.map((artist) => {
    return artist.name;
  }).join('/')
};

export {
  typeFilter,
  artistFilter,
};
