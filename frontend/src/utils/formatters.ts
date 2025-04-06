/**
 * Định dạng ngày tháng thành chuỗi dd/MM/yyyy
 * @param dateString Chuỗi hoặc đối tượng Date cần định dạng
 * @returns Chuỗi ngày tháng đã định dạng
 */
export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'Không hợp lệ';
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Định dạng ngày tháng theo locale Việt Nam
 * @param dateString Chuỗi hoặc undefined cần định dạng
 * @returns Chuỗi ngày tháng đã định dạng theo locale Việt Nam (dd/MM/yyyy)
 */
export function formatDateVN(dateString: string | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Định dạng số thành chuỗi có phân cách hàng nghìn
 * @param number Số cần định dạng
 * @returns Chuỗi số đã định dạng với dấu phân cách hàng nghìn
 */
export function formatNumber(number: number): string {
  return number.toLocaleString('vi-VN');
}

/**
 * Cắt ngắn văn bản nếu vượt quá độ dài tối đa
 * @param text Văn bản cần cắt ngắn
 * @param maxLength Độ dài tối đa
 * @returns Văn bản đã cắt ngắn kèm dấu "..." nếu cần
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
