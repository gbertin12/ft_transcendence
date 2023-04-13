#!/bin/sh

[ $1 ] || exit 1
    
curl -v https://api.intra.42.fr/oauth/token \
     -F grant_type=authorization_code \
     -F client_id=u-s4t2ud-392e919c5957cd22c186e082804f1b9378ca5c2d56984a0c763c7104f165aa0a \
     -F client_secret=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 \
     -F redirect_uri=http://localhost:3000/auth/callback \
     -F code="$1"
