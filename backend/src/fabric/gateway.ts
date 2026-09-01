import * as crypto from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as grpc from '@grpc/grpc-js';
import { connect, Contract, Gateway, Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import { config, OrgKey } from '../config';

async function newGrpcConnection(peerEndpoint: string, tlsCertPath: string, peerHostAlias: string): Promise<grpc.Client> {
    const tlsRootCert = await fs.readFile(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerHostAlias,
    });
}

async function newIdentity(mspId: string, mspPath: string): Promise<Identity> {
    const certDir = path.join(mspPath, 'signcerts');
    const certFiles = await fs.readdir(certDir);
    const credentials = await fs.readFile(path.join(certDir, certFiles[0]));
    return { mspId, credentials };
}

async function newSigner(mspPath: string): Promise<Signer> {
    const keyDir = path.join(mspPath, 'keystore');
    const keyFiles = await fs.readdir(keyDir);
    const privateKeyPem = await fs.readFile(path.join(keyDir, keyFiles[0]));
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

interface OrgConnection {
    grpcClient: grpc.Client;
    gateway: Gateway;
}

const connections = new Map<OrgKey, OrgConnection>();

async function connectOrg(orgKey: OrgKey): Promise<OrgConnection> {
    const org = config[orgKey];
    const grpcClient = await newGrpcConnection(org.peerEndpoint, org.tlsCertPath, org.peerHostAlias);
    const identity = await newIdentity(org.mspId, org.mspPath);
    const signer = await newSigner(org.mspPath);

    const gateway = connect({
        client: grpcClient,
        identity,
        signer,
        evaluateOptions: () => ({ deadline: Date.now() + 5000 }),
        endorseOptions: () => ({ deadline: Date.now() + 15000 }),
        submitOptions: () => ({ deadline: Date.now() + 5000 }),
        commitStatusOptions: () => ({ deadline: Date.now() + 60000 }),
    });

    return { grpcClient, gateway };
}

/**
 * Returns a Contract handle acting as the given org's gateway identity.
 * org1 = Lender Consortium gateway (used for lender-facing actions).
 * org2 = Regulator / Bangladesh Bank gateway (used for regulator-only actions).
 * Connections are cached and reused across requests.
 */
export async function getContract(orgKey: OrgKey): Promise<Contract> {
    let conn = connections.get(orgKey);
    if (!conn) {
        conn = await connectOrg(orgKey);
        connections.set(orgKey, conn);
    }
    return conn.gateway.getNetwork(config.channelName).getContract(config.chaincodeName);
}

export function closeAllConnections(): void {
    for (const conn of connections.values()) {
        conn.gateway.close();
        conn.grpcClient.close();
    }
    connections.clear();
}
