// 日期格式化工具：Date 对象 -> 'yyyy-MM-dd HH:mm:ss'
function formatDateTime(date) {
  const pad = (n) => String(n).padStart(2, '0');

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

module.exports = { formatDateTime };
