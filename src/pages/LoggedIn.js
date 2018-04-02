import React from 'react';
import {inject, observer} from 'mobx-react';


import Card, {CardActions, CardContent} from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import styled from "styled-components";

const LoggedIn = function LoggedIn(props) {


  return (
    <div>
      <StyledCard>
        <CardContent>

          {(!props.auth.currentUser) && (
            <Typography type="display2">
              Not currently logged in
            </Typography>
          )}

          {(props.auth.currentUser) && (<div>

            <Typography type="display2" gutterBottom>
              {props.auth.currentUser.displayName} you successfully logged in :)
            </Typography>

            <Typography type="headline" component="h2" gutterBottom>
              It's great to see you here!
            </Typography>

          </div>)}
        </CardContent>

        <CardActions>
          {/*<Button dense>Learn More</Button>*/}
        </CardActions>

      </StyledCard>



    </div>
  );
};


export default inject('auth')(observer(LoggedIn));


const StyledCard = styled(Card)`
    max-width: 600px;
    margin: 40px auto;

    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }

`;
