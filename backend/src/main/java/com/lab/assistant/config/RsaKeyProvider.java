package com.lab.assistant.config;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.OAEPParameterSpec;
import javax.crypto.spec.PSource;
import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.MGF1ParameterSpec;
import java.util.Base64;

@Component
@Getter
@Slf4j
public class RsaKeyProvider {

    private final RSAPublicKey publicKey;
    private final RSAPrivateKey privateKey;
    private final String publicKeyPem;

    public RsaKeyProvider() throws NoSuchAlgorithmException {
        log.info("Generating RSA 2048-bit key pair for password transmission encryption...");
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
        kpg.initialize(2048);
        KeyPair kp = kpg.generateKeyPair();
        this.publicKey = (RSAPublicKey) kp.getPublic();
        this.privateKey = (RSAPrivateKey) kp.getPrivate();

        // Convert public key to PEM format
        String base64Key = Base64.getEncoder().encodeToString(publicKey.getEncoded());
        this.publicKeyPem = "-----BEGIN PUBLIC KEY-----\n" +
                chunkString(base64Key, 64) +
                "\n-----END PUBLIC KEY-----";
        log.info("RSA 2048-bit key pair generated successfully.");
    }

    public String decrypt(String base64EncryptedData) throws Exception {
        Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
        OAEPParameterSpec oaepSha256 = new OAEPParameterSpec(
                "SHA-256",
                "MGF1",
                MGF1ParameterSpec.SHA256,
                PSource.PSpecified.DEFAULT
        );
        cipher.init(Cipher.DECRYPT_MODE, privateKey, oaepSha256);
        byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(base64EncryptedData));
        return new String(decryptedBytes, StandardCharsets.UTF_8);
    }

    private String chunkString(String input, int chunkSize) {
        StringBuilder sb = new StringBuilder();
        int len = input.length();
        for (int i = 0; i < len; i += chunkSize) {
            if (i > 0) sb.append("\n");
            sb.append(input, i, Math.min(len, i + chunkSize));
        }
        return sb.toString();
    }
}
