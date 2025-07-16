import axios, { AxiosInstance } from 'axios';
import { 
  User,
  Puck,
  Vent,
  Room,
  Structure,
  StructureHeatCoolMode,
  Model,
} from 'flair-api-ts';
import { plainToClass } from 'class-transformer';
import { AuthStrategy } from './auth/AuthStrategy';
import { Logger } from 'homebridge';

/**
 * Modern Flair API client with flexible authentication
 */
export class FlairClient {
  private readonly axios: AxiosInstance;
  private readonly baseURL = 'https://api.flair.co';

  constructor(
    private readonly authStrategy: AuthStrategy,
    private readonly log: Logger,
  ) {
    this.axios = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.authStrategy.configureAxios(this.axios);
  }

  /**
   * Validate credentials by attempting to fetch users
   */
  async validateCredentials(): Promise<boolean> {
    try {
      await this.getUsers();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all users
   */
  async getUsers(): Promise<User[]> {
    const response = await this.axios.get<User[]>('/api/users');
    return plainToClass(User, response.data);
  }

  /**
   * Get all pucks
   */
  async getPucks(): Promise<Puck[]> {
    const response = await this.axios.get<Puck[]>('/api/pucks', {
      params: { expand: 'structure,room' },
    });
    return plainToClass(Puck, response.data);
  }

  /**
   * Get puck by ID
   */
  async getPuck(puckId: string): Promise<Puck> {
    const response = await this.axios.get<Puck>(`/api/pucks/${puckId}/current-reading`);
    return plainToClass(Puck, response.data);
  }

  /**
   * Get all vents
   */
  async getVents(): Promise<Vent[]> {
    const response = await this.axios.get<Vent[]>('/api/vents', {
      params: { expand: 'structure,room' },
    });
    return plainToClass(Vent, response.data);
  }

  /**
   * Get vent by ID
   */
  async getVent(ventId: string): Promise<Vent> {
    const response = await this.axios.get<Vent>(`/api/vents/${ventId}/current-reading`);
    return plainToClass(Vent, response.data);
  }

  /**
   * Set vent percent open
   */
  async setVentPercentOpen(vent: Vent | Model, percentOpen: number): Promise<Vent> {
    const ventId = typeof vent === 'string' ? vent : vent.id;
    const response = await this.axios.patch<Vent>(
      `/api/vents/${ventId}`,
      { 'percent-open': percentOpen },
    );
    return plainToClass(Vent, response.data);
  }

  /**
   * Get all rooms
   */
  async getRooms(): Promise<Room[]> {
    const response = await this.axios.get<Room[]>('/api/rooms', {
      params: { expand: 'structure,pucks' },
    });
    return plainToClass(Room, response.data);
  }

  /**
   * Get room by ID or model
   */
  async getRoom(room: Room | Model | string): Promise<Room> {
    const roomId = typeof room === 'string' ? room : room.id;
    const response = await this.axios.get<Room>(`/api/rooms/${roomId}`);
    return plainToClass(Room, response.data);
  }

  /**
   * Set room temperature set point
   */
  async setRoomSetPoint(room: Room | Model, temperature: number): Promise<Room> {
    const roomId = typeof room === 'string' ? room : room.id;
    const tempC = this.fahrenheitToCelsius(temperature);
    
    const response = await this.axios.patch<Room>(
      `/api/rooms/${roomId}`,
      { 'set-point-c': tempC },
    );
    return plainToClass(Room, response.data);
  }

  /**
   * Set room active/away state
   */
  async setRoomAway(room: Room | Model, away: boolean): Promise<Room> {
    const roomId = typeof room === 'string' ? room : room.id;
    const response = await this.axios.patch<Room>(
      `/api/rooms/${roomId}`,
      { active: !away },
    );
    return plainToClass(Room, response.data);
  }

  /**
   * Get all structures
   */
  async getStructures(): Promise<Structure[]> {
    const response = await this.axios.get<Structure[]>('/api/structures');
    return plainToClass(Structure, response.data);
  }

  /**
   * Get primary structure
   */
  async getPrimaryStructure(): Promise<Structure> {
    const structures = await this.getStructures();
    
    // Flair API typically returns the first structure as primary
    // The 'primary' field may not exist on the Structure type
    if (structures.length === 0) {
      throw new Error('No structures found');
    }
    
    // Return the first structure as primary
    return structures[0];
  }

  /**
   * Get structure by ID
   */
  async getStructure(structureId: string): Promise<Structure> {
    const response = await this.axios.get<Structure>(`/api/structures/${structureId}`);
    return plainToClass(Structure, response.data);
  }

  /**
   * Set structure mode
   */
  async setStructureMode(
    structure: Structure | Model,
    mode: StructureHeatCoolMode,
  ): Promise<Structure> {
    const structureId = typeof structure === 'string' ? structure : structure.id;
    const response = await this.axios.patch<Structure>(
      `/api/structures/${structureId}`,
      { mode: StructureHeatCoolMode[mode] },
    );
    return plainToClass(Structure, response.data);
  }

  /**
   * Set structure temperature set point
   */
  async setStructureSetPoint(
    structure: Structure | Model,
    temperature: number,
  ): Promise<Structure> {
    const structureId = typeof structure === 'string' ? structure : structure.id;
    const tempC = this.fahrenheitToCelsius(temperature);
    
    const response = await this.axios.patch<Structure>(
      `/api/structures/${structureId}`,
      { 'set-point-temperature-c': tempC },
    );
    return plainToClass(Structure, response.data);
  }

  /**
   * Convert Fahrenheit to Celsius
   */
  private fahrenheitToCelsius(fahrenheit: number): number {
    return (fahrenheit - 32) * 5 / 9;
  }
}