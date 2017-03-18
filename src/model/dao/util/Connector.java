package model.dao.util;

import java.sql.Connection;
import java.sql.DriverManager;

public class Connector
{
	public static Connection get()
	{
		try
		{
			Class.forName("com.mysql.jdbc.Driver");
			return DriverManager. getConnection("jdbc:mysql://localhost:3306/forumdb?autoReconnect=true&useSSL=true", "root", "root");
		} catch (Exception e)
		{
			e.printStackTrace();
		}
		return null;
	}
	
}
