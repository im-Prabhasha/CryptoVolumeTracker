import { InsertUser, User, InsertCrypto, CryptoCoin, InsertVolumeSpike, VolumeSpike } from "@shared/schema";

export interface IStorage {
  // User operations (from original template)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Crypto operations
  getCryptoCoins(): Promise<CryptoCoin[]>;
  getCryptoCoin(id: string): Promise<CryptoCoin | undefined>;
  saveCryptoCoin(coin: InsertCrypto): Promise<CryptoCoin>;
  
  // Volume spike operations
  recordVolumeSpike(spike: InsertVolumeSpike): Promise<VolumeSpike>;
  getVolumeSpikes(limit?: number): Promise<VolumeSpike[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cryptoCoins: Map<string, CryptoCoin>;
  private volumeSpikes: VolumeSpike[];
  private userCurrentId: number;
  private coinCurrentId: number;
  private spikeCurrentId: number;

  constructor() {
    this.users = new Map();
    this.cryptoCoins = new Map();
    this.volumeSpikes = [];
    this.userCurrentId = 1;
    this.coinCurrentId = 1;
    this.spikeCurrentId = 1;
  }

  // User methods (from original template)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Crypto methods
  async getCryptoCoins(): Promise<CryptoCoin[]> {
    return Array.from(this.cryptoCoins.values());
  }

  async getCryptoCoin(coinId: string): Promise<CryptoCoin | undefined> {
    return this.cryptoCoins.get(coinId);
  }

  async saveCryptoCoin(insertCoin: InsertCrypto): Promise<CryptoCoin> {
    // Check if coin already exists
    const existingCoin = this.cryptoCoins.get(insertCoin.coinId);
    
    if (existingCoin) {
      // Update existing coin
      const updatedCoin = {
        ...existingCoin,
        ...insertCoin,
        lastUpdated: new Date(),
      };
      this.cryptoCoins.set(insertCoin.coinId, updatedCoin);
      return updatedCoin;
    } else {
      // Create new coin
      const id = this.coinCurrentId++;
      const coin: CryptoCoin = { 
        ...insertCoin, 
        id,
        lastUpdated: new Date(),
      };
      this.cryptoCoins.set(insertCoin.coinId, coin);
      return coin;
    }
  }

  // Volume spike methods
  async recordVolumeSpike(insertSpike: InsertVolumeSpike): Promise<VolumeSpike> {
    const id = this.spikeCurrentId++;
    const spike: VolumeSpike = { 
      ...insertSpike, 
      id,
      timestamp: new Date()
    };
    
    this.volumeSpikes.push(spike);
    
    // Keep only the last 1000 spikes to limit memory usage
    if (this.volumeSpikes.length > 1000) {
      this.volumeSpikes = this.volumeSpikes.slice(-1000);
    }
    
    return spike;
  }

  async getVolumeSpikes(limit = 100): Promise<VolumeSpike[]> {
    // Return the most recent spikes, limited by the limit parameter
    return this.volumeSpikes
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
