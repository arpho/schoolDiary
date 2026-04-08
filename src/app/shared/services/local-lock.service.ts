import { Injectable, signal } from '@angular/core';
import { Md5 } from 'ts-md5';

@Injectable({
  providedIn: 'root'
})
export class LocalLockService {
  private readonly STORAGE_KEY = 'schooldiary_password_hash';
  
  // State indicating if the app is currently locked
  isLocked = signal<boolean>(false);

  constructor() {
    // On initialization, if a password hash exists, we consider the app locked
    if (this.hasPasswordSet()) {
      this.isLocked.set(true);
    }
  }

  /**
   * Sets up or updates the local lock password.
   * @param password The password to hash and store
   */
  setupPassword(password: string): void {
    const hash = Md5.hashStr(password);
    localStorage.setItem(this.STORAGE_KEY, hash);
    // When setting up, we might choose to keep it unlocked until next session
    // but usually, we want to ensure state is consistent.
    // In this port, we assume if it's set, it's ready to be used.
    this.isLocked.set(false); 
  }

  /**
   * Attempts to unlock the app with the provided password.
   * @param password The password to check
   * @returns true if successful, false otherwise
   */
  unlock(password: string): boolean {
    const savedHash = localStorage.getItem(this.STORAGE_KEY);
    if (!savedHash) {
      this.isLocked.set(false);
      return true;
    }

    const inputHash = Md5.hashStr(password);
    if (inputHash === savedHash) {
      this.isLocked.set(false);
      return true;
    }

    return false;
  }

  /**
   * Checks if a password has been set.
   */
  hasPasswordSet(): boolean {
    return !!localStorage.getItem(this.STORAGE_KEY);
  }

  /**
   * Locks the application manually.
   */
  lockManually(): void {
    if (this.hasPasswordSet()) {
      this.isLocked.set(true);
    }
  }

  /**
   * Clears the lock (e.g., on logout).
   */
  clearLock(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.isLocked.set(false);
  }
}
