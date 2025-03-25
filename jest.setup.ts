import { jest } from '@jest/globals';

// 扩展 Jest 的全局类型
declare global {
  namespace jest {
    interface Mock<T = any, Y extends any[] = any> {
      mockResolvedValue: (value: T) => jest.Mock<Promise<T>, Y>;
      mockRejectedValue: (value: any) => jest.Mock<Promise<never>, Y>;
    }
  }
}

// 设置测试环境变量
process.env.SPOTIFY_ACCESS_TOKEN = 'test-token'; 