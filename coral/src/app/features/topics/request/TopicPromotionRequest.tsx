import {
  Alert,
  Box,
  Button,
  Divider,
  Input,
  Option,
  useToast,
} from "@aivenio/aquarium";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SubmitHandler } from "react-hook-form";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Dialog } from "src/app/components/Dialog";
import {
  Form,
  NativeSelect,
  SubmitButton,
  TextInput,
  Textarea,
  useForm,
} from "src/app/components/Form";
import AdvancedConfiguration from "src/app/features/topics/request/components/AdvancedConfiguration";
import SelectOrNumberInput from "src/app/features/topics/request/components/SelectOrNumberInput";
import type { Schema } from "src/app/features/topics/request/form-schemas/topic-request-form";
import formSchema from "src/app/features/topics/request/form-schemas/topic-request-form";
import { generateTopicNameDescription } from "src/app/features/topics/request/utils";
import { Environment } from "src/domain/environment";
import { getAllEnvironmentsForTopicAndAcl } from "src/domain/environment/environment-api";
import {
  TopicDetailsPerEnv,
  getTopicDetailsPerEnv,
  promoteTopic,
} from "src/domain/topic";
import { HTTPError } from "src/services/api";
import { parseErrorMsg } from "src/services/mutation-utils";

function TopicPromotionRequest() {
  const { topicName } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const sourceEnv = searchParams.get("sourceEnv");
  const targetEnv = searchParams.get("targetEnv");

  const [cancelDialogVisible, setCancelDialogVisible] = useState(false);

  const { data: environments } = useQuery<Environment[], HTTPError>(
    ["getEnvironmentsForTopicRequest"],
    {
      queryFn: () => getAllEnvironmentsForTopicAndAcl(),
    }
  );

  const { data: topicDetailsForSourceEnv } = useQuery<
    TopicDetailsPerEnv,
    HTTPError
  >(["getTopicDetailsPerEnv", topicName, sourceEnv], {
    queryFn: () =>
      getTopicDetailsPerEnv({
        topicname: topicName || "",
        envSelected: sourceEnv || "",
      }),
  });

  const targetEnvironment = environments?.find(({ id }) => id === targetEnv);

  const form = useForm<Schema>({
    schema: formSchema,
    defaultValues: {
      environment: undefined,
      topicpartitions: undefined,
      replicationfactor: undefined,
      topicname: topicName,
      remarks: "",
      description: "",
      advancedConfiguration: "{\n}",
    },
  });

  useEffect(() => {
    if (
      targetEnvironment !== undefined &&
      targetEnvironment.params !== undefined &&
      topicDetailsForSourceEnv !== undefined
    ) {
      form.setValue("environment", targetEnvironment);
      form.setValue(
        "topicpartitions",
        String(targetEnvironment?.params.defaultPartitions)
      );
      form.setValue(
        "replicationfactor",
        String(targetEnvironment?.params.defaultRepFactor)
      );

      if (topicDetailsForSourceEnv.topicContents?.description !== undefined) {
        form.setValue(
          "description",
          topicDetailsForSourceEnv.topicContents.description
        );
      }

      if (
        topicDetailsForSourceEnv.topicContents?.advancedTopicConfiguration !==
        undefined
      ) {
        form.setValue(
          "advancedConfiguration",
          JSON.stringify(
            topicDetailsForSourceEnv.topicContents.advancedTopicConfiguration
          )
        );
      }
    }
  }, [targetEnvironment, topicDetailsForSourceEnv]);

  const {
    mutate: promote,
    isLoading: promoteIsLoading,
    isError: promoteIsError,
    error: promoteError,
  } = useMutation(promoteTopic, {
    onSuccess: () => {
      navigate(-1);
      toast({
        message: "Topic promotion request successfully created",
        position: "bottom-left",
        variant: "default",
      });
    },
  });

  const onPromoteSubmit: SubmitHandler<Schema> = (data) => promote(data);

  function cancelRequest() {
    form.reset();
    navigate(-1);
  }

  return (
    <>
      {cancelDialogVisible && (
        <Dialog
          title={`Cancel topic promotion request?`}
          primaryAction={{
            text: `Cancel request`,
            onClick: () => cancelRequest(),
          }}
          secondaryAction={{
            text: `Continue with request`,
            onClick: () => setCancelDialogVisible(false),
          }}
          type={"warning"}
        >
          Do you want to cancel this request? The data added will be lost.
        </Dialog>
      )}
      {promoteIsError && (
        <Box marginBottom={"l1"} role="alert">
          <Alert type="error">{parseErrorMsg(promoteError)}</Alert>
        </Box>
      )}
      <Form
        {...form}
        ariaLabel={"Request topic promotion"}
        onSubmit={onPromoteSubmit}
      >
        <Box width={"full"}>
          {targetEnvironment !== undefined ? (
            <NativeSelect
              name="environment"
              labelText={"Environment"}
              required
              readOnly
            >
              <Option
                key={targetEnvironment.name}
                value={targetEnvironment.name}
              >
                {targetEnvironment.name}
              </Option>
            </NativeSelect>
          ) : (
            <NativeSelect.Skeleton />
          )}
        </Box>
        <Box paddingY={"l1"}>
          <Divider />
        </Box>
        <TextInput<Schema>
          name={"topicname"}
          labelText="Topic name"
          placeholder={generateTopicNameDescription(targetEnvironment?.params)}
          required={true}
          readOnly
        />
        <Box.Flex gap={"l1"}>
          <Box grow={1} width={"1/2"}>
            {targetEnvironment !== undefined ? (
              <SelectOrNumberInput
                name={"topicpartitions"}
                label={"Topic partitions"}
                max={targetEnvironment.params?.maxPartitions}
                required={true}
              />
            ) : (
              <Input.Skeleton />
            )}
          </Box>
          <Box grow={1} width={"1/2"}>
            {targetEnvironment !== undefined ? (
              <SelectOrNumberInput
                name={"replicationfactor"}
                label={"Replication factor"}
                max={targetEnvironment.params?.maxRepFactor}
                required={true}
              />
            ) : (
              <Input.Skeleton />
            )}
          </Box>
        </Box.Flex>

        <Box paddingY={"l1"}>
          <Divider />
        </Box>
        <AdvancedConfiguration name={"advancedConfiguration"} />

        <Box paddingY={"l1"}>
          <Divider />
        </Box>
        <Box.Flex gap={"l1"}>
          <Box grow={1} width={"1/2"}>
            <Textarea<Schema>
              name="description"
              labelText="Description"
              rows={5}
              required={true}
              readOnly
            />
          </Box>
          <Box grow={1} width={"1/2"}>
            <Textarea<Schema>
              name="remarks"
              labelText="Message for approval"
              rows={5}
            />
          </Box>
        </Box.Flex>

        <Box display={"flex"} colGap={"l1"} marginTop={"3"}>
          <SubmitButton loading={promoteIsLoading}>
            Submit promotion request
          </SubmitButton>
          <Button
            type="button"
            kind={"secondary"}
            onClick={
              form.formState.isDirty
                ? () => setCancelDialogVisible(true)
                : () => cancelRequest()
            }
          >
            Cancel
          </Button>
        </Box>
      </Form>
    </>
  );
}

export default TopicPromotionRequest;