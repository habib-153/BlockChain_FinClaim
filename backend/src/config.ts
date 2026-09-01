import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
    const value = process.env[name] ?? fallback;
    if (value === undefined) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

const fabricSamplesPath = required('FABRIC_SAMPLES_PATH');
const testNetworkOrgs = path.join(fabricSamplesPath, 'test-network', 'organizations', 'peerOrganizations');

function orgPaths(domain: string, peerHostAlias: string) {
    const orgDir = path.join(testNetworkOrgs, domain);
    return {
        tlsCertPath: path.join(orgDir, 'peers', peerHostAlias, 'tls', 'ca.crt'),
        mspPath: path.join(orgDir, 'users', `User1@${domain}`, 'msp'),
    };
}

export const config = {
    port: Number(process.env.PORT ?? 4000),
    channelName: required('CHANNEL_NAME', 'mychannel'),
    chaincodeName: required('CHAINCODE_NAME', 'finclaim'),

    org1: {
        mspId: required('ORG1_MSP_ID', 'Org1MSP'),
        peerEndpoint: required('ORG1_PEER_ENDPOINT', 'localhost:7051'),
        peerHostAlias: required('ORG1_PEER_HOST_ALIAS', 'peer0.org1.example.com'),
        ...orgPaths('org1.example.com', required('ORG1_PEER_HOST_ALIAS', 'peer0.org1.example.com')),
    },
    org2: {
        mspId: required('ORG2_MSP_ID', 'Org2MSP'),
        peerEndpoint: required('ORG2_PEER_ENDPOINT', 'localhost:9051'),
        peerHostAlias: required('ORG2_PEER_HOST_ALIAS', 'peer0.org2.example.com'),
        ...orgPaths('org2.example.com', required('ORG2_PEER_HOST_ALIAS', 'peer0.org2.example.com')),
    },

    invoiceEncryptionKey: process.env.INVOICE_ENCRYPTION_KEY ?? '',
    publicAnchorRpcUrl: process.env.PUBLIC_ANCHOR_RPC_URL ?? '',
    publicAnchorPrivateKey: process.env.PUBLIC_ANCHOR_PRIVATE_KEY ?? '',

    dataDir: path.join(__dirname, '..', 'data'),
};

export type OrgKey = 'org1' | 'org2';
