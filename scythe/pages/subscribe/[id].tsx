import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useIsAuthenticated } from '../../src/state/authentication/hooks';

const SubscribePage: React.FC<{}> = () => {

  const router = useRouter();
  const { id } = router.query;
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    router.push("/login");
  }

  useEffect(() => {
    // fetch and load discord server info
  }, [id]);

  return (
    <React.Fragment>
       
    </React.Fragment>
  )
}

export default SubscribePage;