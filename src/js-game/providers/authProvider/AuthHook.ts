import { useCallback, useContext, useState } from 'react';
import { AuthContext } from './AuthContext';

export const useAuth = () => useContext(AuthContext);
