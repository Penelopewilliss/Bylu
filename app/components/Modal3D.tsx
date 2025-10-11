import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Text, ModalProps } from 'react-native';

interface Modal3DProps extends ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  showCloseButton?: boolean;
}

export default function Modal3D({ 
  visible, 
  onClose, 
  children, 
  title,
  showCloseButton = true,
  ...modalProps 
}: Modal3DProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      {...modalProps}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          {(title || showCloseButton) && (
            <View style={styles.modalHeader}>
              {title && (
                <Text style={styles.modalTitle}>{title}</Text>
              )}
              {showCloseButton && (
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={onClose}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {/* Modal Content */}
          <View style={styles.modalContent}>
            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    // Enhanced 3D shadow effects
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.35,
    shadowRadius: 25,
    elevation: 25,
    // 3D beveled borders
    borderTopWidth: 3,
    borderTopColor: '#FFFFFF',
    borderLeftWidth: 3,
    borderLeftColor: '#FFFFFF',
    borderRightWidth: 3,
    borderRightColor: '#E0E0E0',
    borderBottomWidth: 3,
    borderBottomColor: '#E0E0E0',
    // Slight 3D transform
    transform: [
      { perspective: 1000 },
      { rotateX: '2deg' },
    ],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#E8B4C4',
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
    // 3D header effects
    borderBottomWidth: 2,
    borderBottomColor: '#D1A1B1',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    flex: 1,
    // Enhanced 3D text shadow
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1A1B1',
    justifyContent: 'center',
    alignItems: 'center',
    // 3D button effects
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    borderTopWidth: 1,
    borderTopColor: '#F0C7D1',
    borderLeftWidth: 1,
    borderLeftColor: '#F0C7D1',
    borderRightWidth: 1,
    borderRightColor: '#B8919E',
    borderBottomWidth: 1,
    borderBottomColor: '#B8919E',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    // 3D text effect
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modalContent: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 17,
    borderBottomRightRadius: 17,
  },
});