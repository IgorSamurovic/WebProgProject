package security;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class Hash
{
	public static String digest(String hash, String salt)
	{
		MessageDigest messageDigest = null;
		try {messageDigest = MessageDigest.getInstance("SHA-256");} catch (NoSuchAlgorithmException e) {e.printStackTrace();}

		for (int i=0; i < 1000; i++)
		{
			hash += salt;
			messageDigest.update(hash.getBytes());
			hash = new String(messageDigest.digest());
		}
		
		return hash;
	} 
}
