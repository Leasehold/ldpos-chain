const {
  validateWalletAddress,
  validateSignature,
  validateMultisigPublicKey,
  validateNextMultisigPublicKey,
} = require('./primitives');

function verifyMultisigTransactionSchema(multisigTransaction, fullCheck, minRequiredSignatures, networkSymbol) {
  if (!multisigTransaction) {
    throw new Error('Multisig transaction was not specified');
  }

  let { signatures } = multisigTransaction;

  if (!Array.isArray(signatures)) {
    throw new Error('Multisig transaction signatures must be an array');
  }
  let processedSignerAddressSet = new Set();
  for (let signaturePacket of signatures) {
    if (!signaturePacket) {
      throw new Error('Some multisig transaction signatures were not specified');
    }
    let {
      signerAddress,
      multisigPublicKey,
      nextMultisigPublicKey,
      signature,
      signatureHash
    } = signaturePacket;

    validateMultisigPublicKey(multisigPublicKey);
    validateNextMultisigPublicKey(nextMultisigPublicKey);

    validateWalletAddress(signerAddress, networkSymbol);
    if (fullCheck) {
      validateSignature(signature);
    } else {
      validateSignatureHash(signatureHash);
    }

    if (processedSignerAddressSet.has(signerAddress)) {
      throw new Error(
        `Multiple multisig transaction signatures were associated with the same member address ${
          signerAddress
        }`
      );
    }
    processedSignerAddressSet.add(signerAddress);
  }
  if (processedSignerAddressSet.size < minRequiredSignatures) {
    throw new Error(
      `Multisig transaction did not have enough member signatures - At least ${
        minRequiredSignatures
      } distinct signatures are required`
    );
  }
}

module.exports = {
  verifyMultisigTransactionSchema
};