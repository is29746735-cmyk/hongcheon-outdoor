/**
 * 업로드 전 클라이언트에서 이미지 리사이즈(용량·비용 절감). 실패 시 원본 반환.
 * 브라우저 전용(createImageBitmap·canvas) — 클라이언트 컴포넌트에서만 사용.
 */
export async function compressImage(
  file: File,
  maxDim = 1280,
  quality = 0.82,
): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bmp, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/jpeg", quality),
    );
    return blob ?? file;
  } catch {
    return file;
  }
}
