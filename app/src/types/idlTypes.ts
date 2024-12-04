export interface Metadata {
    name: string;
    version: string;
    spec: string;
    description: string;
  }
  
  export interface Instruction {
    name: string;
    discriminator: number[];
    accounts: Array<{
      name: string;
      writable: boolean;
      signer: boolean;
      pda?: {
        seeds: Array<{ kind: string; value?: number[]; path?: string; account?: string }>;
      };
    }>;
    args: Array<{ name: string; type: string }>;
  }
  
  export interface TodoIdl {
    address: string;
    metadata: Metadata;
    instructions: Instruction[];
    accounts: Array<{ name: string; discriminator: number[] }>;
    types: Array<{ name: string; type: { kind: string; fields: Array<{ name: string; type: string }> } }>;
    errors: Array<{ code: number; name: string; msg: string }>;
    constants: Array<{ name: string; type: string; value: string }>;
  }
  