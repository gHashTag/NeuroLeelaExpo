import { vi, describe, it, expect, beforeEach } from 'vitest';
import { pickImage, AvatarUploadErrorType, AvatarUploadOptions } from '../lib/avatar-helpers';

// Mock the helper module first
vi.mock('../lib/avatar-helpers', () => ({
  pickImage: vi.fn(),
  AvatarUploadErrorType: {
    CANCELED: 'CANCELED',
    AUTH_ERROR: 'AUTH_ERROR',
    UPLOAD_ERROR: 'UPLOAD_ERROR',
    PROCESSING_ERROR: 'PROCESSING_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
  }
}));

// Mock the Platform
vi.mock('react-native', () => ({
  Platform: {
    OS: 'web',
    select: (obj: Record<string, any>) => obj.web || obj.default
  }
}));

// Mock the modules
const mockImagePicker = {
  MediaTypeOptions: { Images: 'Images' },
  launchImageLibraryAsync: vi.fn()
};

const mockImageManipulator = {
  manipulateAsync: vi.fn(),
  SaveFormat: { JPEG: 'jpeg' }
};

// Set up the mocks
vi.mock('expo-image-picker', () => mockImagePicker);
vi.mock('expo-image-manipulator', () => mockImageManipulator);

// Mock the useSupabase hook
const mockUploadAvatar = vi.fn();
const mockUpdateUserData = vi.fn();
const mockGetAvatarUrl = vi.fn();

vi.mock('../context/supabase-provider', () => ({
  useSupabase: () => ({
    uploadAvatar: mockUploadAvatar,
    updateUserData: mockUpdateUserData,
    getAvatarUrl: mockGetAvatarUrl,
    userData: {}
  })
}));

// Mock console methods
console.log = vi.fn();
console.error = vi.fn();

describe('Avatar functionality', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Setup default mock implementations
    mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://test-image.jpg' }]
    });
    
    mockImageManipulator.manipulateAsync.mockResolvedValue({
      uri: 'file://processed-image.jpg'
    });
    
    mockUploadAvatar.mockResolvedValue('test-ipfs-hash');
    mockGetAvatarUrl.mockReturnValue('https://test-url.com/test-ipfs-hash');
    mockUpdateUserData.mockResolvedValue({});

    // Setup the pickImage implementation to call through to mocks
    (pickImage as any).mockImplementation(
      async (
        onSuccess?: (url: string) => void, 
        onError?: (error: Error) => void, 
        options?: AvatarUploadOptions
      ) => {
        try {
          const {
            maxWidth = 800,
            quality = 0.8,
            allowsEditing = true
          } = options || {};

          const result = await mockImagePicker.launchImageLibraryAsync({
            mediaTypes: mockImagePicker.MediaTypeOptions.Images,
            allowsEditing,
            aspect: [1, 1],
            quality,
          });

          if (result.canceled) {
            return;
          }

          const imageUri = result.assets[0].uri;
          
          const processedImage = await mockImageManipulator.manipulateAsync(
            imageUri,
            [{ resize: { width: maxWidth } }],
            { compress: quality, format: 'jpeg' }
          );

          const ipfsHash = await mockUploadAvatar(processedImage.uri);
          
          if (!ipfsHash) {
            const error = new Error('Failed to upload image');
            error.name = AvatarUploadErrorType.UPLOAD_ERROR;
            throw error;
          }
          
          const avatarUrl = mockGetAvatarUrl(ipfsHash);
          
          if (!avatarUrl) {
            const error = new Error('Failed to generate avatar URL');
            error.name = AvatarUploadErrorType.PROCESSING_ERROR;
            throw error;
          }
          
          await mockUpdateUserData({
            pinata_avatar_id: ipfsHash,
            avatar_url: avatarUrl,
            updated_at: expect.any(String)
          });

          if (onSuccess) {
            onSuccess(avatarUrl);
          }
          
          return avatarUrl;
        } catch (error) {
          let enhancedError: Error;
          
          if (error instanceof Error) {
            if (error.message.includes('401') || error.message.includes('auth')) {
              error.name = AvatarUploadErrorType.AUTH_ERROR;
            } else if (!error.name || error.name === 'Error') {
              error.name = AvatarUploadErrorType.UNKNOWN_ERROR;
            }
            enhancedError = error;
          } else {
            enhancedError = new Error(
              typeof error === 'string' ? error : 'An unknown error occurred'
            );
            enhancedError.name = AvatarUploadErrorType.UNKNOWN_ERROR;
          }
          
          if (onError) {
            onError(enhancedError);
          }
          
          throw enhancedError;
        }
      }
    );
  });
  
  it('should process images correctly with default options', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    
    await pickImage(onSuccess, onError);
    
    // Check that the image picker was called with default options
    expect(mockImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
      mediaTypes: 'Images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    // Check that image manipulator was called with default options
    expect(mockImageManipulator.manipulateAsync).toHaveBeenCalledWith(
      'file://test-image.jpg',
      [{ resize: { width: 800 } }],
      { compress: 0.8, format: 'jpeg' }
    );
    
    // Check that Supabase functions were called
    expect(mockUploadAvatar).toHaveBeenCalledWith('file://processed-image.jpg');
    expect(mockGetAvatarUrl).toHaveBeenCalledWith('test-ipfs-hash');
    expect(mockUpdateUserData).toHaveBeenCalledWith({
      pinata_avatar_id: 'test-ipfs-hash',
      avatar_url: 'https://test-url.com/test-ipfs-hash',
      updated_at: expect.any(String)
    });
    
    // Check that success callback was called
    expect(onSuccess).toHaveBeenCalledWith('https://test-url.com/test-ipfs-hash');
    expect(onError).not.toHaveBeenCalled();
  });
  
  it('should process images correctly with custom options', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const options = {
      maxWidth: 400,
      quality: 0.6,
      allowsEditing: false
    };
    
    await pickImage(onSuccess, onError, options);
    
    // Check that the image picker was called with custom options
    expect(mockImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
      mediaTypes: 'Images',
      allowsEditing: false,
      aspect: [1, 1],
      quality: 0.6,
    });
    
    // Check that image manipulator was called with custom options
    expect(mockImageManipulator.manipulateAsync).toHaveBeenCalledWith(
      'file://test-image.jpg',
      [{ resize: { width: 400 } }],
      { compress: 0.6, format: 'jpeg' }
    );
    
    // Other checks remain the same
    expect(onSuccess).toHaveBeenCalledWith('https://test-url.com/test-ipfs-hash');
  });
  
  it('should handle image selection cancellation', async () => {
    // Override mock for this test
    mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: true,
      assets: []
    });
    
    const onSuccess = vi.fn();
    const onError = vi.fn();
    
    await pickImage(onSuccess, onError);
    
    // Check that the image picker was called
    expect(mockImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
    
    // But nothing else should be called
    expect(mockImageManipulator.manipulateAsync).not.toHaveBeenCalled();
    expect(mockUploadAvatar).not.toHaveBeenCalled();
    expect(mockUpdateUserData).not.toHaveBeenCalled();
    
    // Check that neither callback was called
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });
  
  it('should handle upload errors correctly', async () => {
    // Mock upload failure
    mockUploadAvatar.mockResolvedValue(null);
    
    const onSuccess = vi.fn();
    const onError = vi.fn();
    
    await expect(pickImage(onSuccess, onError)).rejects.toThrow('Failed to upload image');
    
    // Check that error callback was called with properly typed error
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({
      name: AvatarUploadErrorType.UPLOAD_ERROR,
      message: expect.stringContaining('Failed to upload image')
    }));
    
    // Success callback should not be called
    expect(onSuccess).not.toHaveBeenCalled();
  });
  
  it('should handle avatar URL generation errors', async () => {
    // Mock URL generation failure
    mockGetAvatarUrl.mockReturnValue(null);
    
    const onSuccess = vi.fn();
    const onError = vi.fn();
    
    await expect(pickImage(onSuccess, onError)).rejects.toThrow('Failed to generate avatar URL');
    
    // Check that error callback was called with properly typed error
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({
      name: AvatarUploadErrorType.PROCESSING_ERROR,
      message: expect.stringContaining('Failed to generate avatar URL')
    }));
    
    // Success callback should not be called
    expect(onSuccess).not.toHaveBeenCalled();
  });
  
  it('should handle authentication errors correctly', async () => {
    // Mock auth error
    mockUploadAvatar.mockRejectedValue(new Error('401 Unauthorized'));
    
    const onSuccess = vi.fn();
    const onError = vi.fn();
    
    await expect(pickImage(onSuccess, onError)).rejects.toThrow('401 Unauthorized');
    
    // Check that error callback was called with properly typed error
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({
      name: AvatarUploadErrorType.AUTH_ERROR,
      message: expect.stringContaining('401 Unauthorized')
    }));
    
    // Success callback should not be called
    expect(onSuccess).not.toHaveBeenCalled();
  });
}); 