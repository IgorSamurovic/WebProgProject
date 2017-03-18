
        function getUserData()
        {
        	user = JSON.parse(JSON.parse(getCookie("user")));
        	if (user == null)
        		return JSON.parse('{"username": "Guest", "banned": "false", "deleted": "false", "role": "0"}');
        	else
        		return user;
        	
        }

		function setCookie(key, value)
        {
            var expires = new Date();
            expires.setTime(expires.getTime() + (1 * 24 * 60 * 60 * 1000));
            document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
        }

        function getCookie(key)
        {
            var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
            return keyValue ? keyValue[2] : null;
        }

        function isAdmin()
        {
        	return getUserData().role === "2";
        }
        
        function isMod()
        {
        	return getUserData().role === "1";
        }
        
        function isUser()
        {
        	return getUserData().role === "0";
        }
        
        function isGuest()
        {
        	return getUserData() === "" || getUserData() == null;
        }