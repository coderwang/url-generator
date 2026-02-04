// 当popup加载完成时执行
document.addEventListener('DOMContentLoaded', (): void => {
  console.log('Hello World popup loaded!');
  
  // TypeScript示例：添加类型安全
  const container: HTMLElement | null = document.querySelector('.container');
  if (container) {
    console.log('Container found:', container);
  }
});
