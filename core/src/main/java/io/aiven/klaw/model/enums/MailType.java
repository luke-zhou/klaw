package io.aiven.klaw.model.enums;

public enum MailType {
  TOPIC_CREATE_REQUESTED,
  TOPIC_PROMOTION_REQUESTED,
  CONNECTOR_CREATE_REQUESTED,
  TOPIC_DELETE_REQUESTED,
  CONNECTOR_DELETE_REQUESTED,
  TOPIC_CLAIM_REQUESTED,
  CONNECTOR_CLAIM_REQUESTED,
  TOPIC_REQUEST_APPROVED,
  CONNECTOR_REQUEST_APPROVED,
  TOPIC_REQUEST_DENIED,
  CONNECTOR_REQUEST_DENIED,
  ACL_REQUESTED,
  ACL_DELETE_REQUESTED,
  ACL_REQUEST_APPROVED,
  ACL_REQUEST_DENIED,
  ACL_REQUEST_FAILURE,
  SCHEMA_REQUESTED,
  SCHEMA_REQUEST_APPROVED,
  SCHEMA_REQUEST_DENIED,
  REGISTER_USER_REQUEST,
  TOPIC_UPDATE_REQUESTED,
  SCHEMA_PROMOTION_REQUESTED,
  NEW_USER_ADDED
}
