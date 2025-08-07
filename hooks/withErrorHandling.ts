export async function withErrorHandling<T>(
  fn: () => Promise<T>
): Promise<T | { error: string }> {
  try {
    return await fn();
  } catch (err: any) {
    console.error("Unexpected server error:", err);
    return { error: "Something went wrong. Please try again later." };
  }
}
